# Summary
# Script for creating weblets 
# Parameters required
#   1. Deployment slot
#   2. Deployment Version
#   3. Deployement URL
#   4. Weblet type
#  All Parameters are optional

# Parameters from build pipeline
# Default parameters are set here which can be altered when ever the build is triggered.
[CmdletBinding()]
param (
    [string] $DeploymentVersion = "1.0",
    [string] $MinorVersion = "6",
    $slot = "all",
    $DeploymentURL = "https://wnc-web-stage.services.xerox.com/",
    $APIDeploymentURL = "https://wncservice-stage.services.xerox.com/",
    $WebletType = "xeroxnoteconverter"
)
Install-Module Microsoft.PowerShell.Archive -MinimumVersion 1.2.3.0 -Repository PSGallery -Force
$Root_Path = Get-Location
$Root_Path = Split-Path $Root_Path
$WebletSpecificPath
$ConfigDev = "CONFIG_DEV"
$ConfigTest = "CONFIG_TEST"
$ConfigStaging = "CONFIG_STAGING"
$ConfigProd = "CONFIG_PROD"

# function to copy file
# target file from whcih the final weblet has to be made
function copyFilesTo($Target_Folder)
{
    # Copy files to the Weblet folder
    write-host "Start Copy files to the Weblet folder "$Target_Folder 
       
    $WebletSpecificFilesToCopy = "css","Scripts","Views","xas","description.xml","tools.png","translations.json","XeroxNoteConverter_*.html","XeroxNoteConverter_*.png"
   
    foreach($file in $WebletSpecificFilesToCopy)
    {
       Get-ChildItem -Path $WebletSpecificPath -Include $file -Recurse| Copy-Item -Destination $Target_Folder -Recurse -Force -Verbose      
    }

    Copy-Item -Path $WebletSpecificPath\Images -Destination $Target_Folder\Images -Recurse

    write-host "End Copy files to the Weblet folder "$Target_Folder   
}
# Function to create and upload the Weblet Zip file
function MakeWebletZip($folderName, $redirectURL,$APIURL, $currentVersion, $currentEnvironment)
{
    write-host "Start Make weblet zip "$folderName
    # Remove the previous folder if any exists and create a new weblet folder
    Remove-Item $folderName -Recurse -ErrorAction Ignore
    $folderCopyPath =  (New-Item -path . -Name $folderName -ItemType Directory -Force).FullName
    copyFilesTo($folderCopyPath)
    # Read the files Description.xml, apps_common.js,html and png files from the Weblet path
    $FinalWebletPath = (Get-ChildItem -Filter $folderName -Directory).FullName    
    $Requiredxmls = Get-Childitem $FinalWebletPath -Recurse -Include "description.xml"    
    $RequiredJson = Get-ChildItem $FinalWebletPath -Recurse -Include "apps_common.js"  
  
    $RequiredHtml = (Get-ChildItem $FinalWebletPath -Recurse -Include "XeroxNoteConverter_*.html").FullName    
    $RequiredPng = (Get-ChildItem $FinalWebletPath -Recurse -Include "XeroxNoteConverter_*.png").FullName   
    write-host "RequiredHtml" $RequiredHtml  
     write-host "RequiredPng" $RequiredPng  
    $newURL = $redirectURL 
    $newAPIURL = $APIURL  
    # rename the html and png files based on the foldernames
    Rename-Item -Path $RequiredHtml -NewName "$folderName.html" -Force -Verbose    
    Rename-Item -Path $RequiredPng -NewName "$folderName.png" -Force -Verbose
    
     write-host "file renamed "
    # Update Description.xml file
    foreach($xmlfile in $Requiredxmls)
    {  
        write-host "xmlfile "$xmlfile
        # Set the version number and label in the description.xml file
        if($xmlfile.FullName -like("*\$folderName\description.xml"))
        {
            Write-Host "updating version in Description.xml version $currentVersion"
            [XML]$fileContents = Get-Content -encoding UTF8 $xmlfile
            if($currentVersion.Value -ne "")
            {
                $fileContents.displayText.version = "$($currentVersion)"
            }
            else {
                $fileContents.displayText.version = "1.0"   
            }
            $labelTag = $fileContents.displayText.label
            if($folderName -like("*-Dev"))
            {
                $labelTag = "$labelTag - Dev"
            }
            elseif ($folderName -like("*-Test")) {
                $labelTag = "$labelTag - Test"
            }
            elseif ($folderName -like("*-Stage")) {
                $labelTag = "$labelTag - Stage"
            }
            $fileContents.displayText.label = $labelTag
            Write-Host "Updating label tag >>> $labelTag"
            $fileContents.Save($xmlfile)
            # Set encoding to encoding in "utf-8"
            $MyRawString = Get-Content -encoding UTF8 -Raw $xmlfile.FullName
	    $encoding = New-Object System.Text.UTF8Encoding
	    [System.IO.File]::WriteAllLines($xmlFile.FullName, $MyRawString, $encoding)
        }
    }
    # Update apps_common.js
    foreach($Jsfile in $RequiredJson)
    {
        if($RequiredJson)
        {
            # updating the Webapp URL
            $fileContent = @(Get-Content -Path $Jsfile -Raw)
            foreach($Jsline in [System.IO.File]::ReadLines($Jsfile))
            {
                if($Jsline -like "var redirectURL =*")
                { 
                    $oldURL = (([regex]".*'(.*)'").Matches($Jsline))[0].Groups[1].Value
                    if(!$redirectURL)
                    {
                        Write-Host "No url specified! So deployment url is unchanged."
                    }
                    else {
                        $fileContent = @($fileContent.Replace($oldURL,$newURL))   
                        Write-Host "Updated redirect url in $Jsfile and value $newURL"
                    }
                }  
                
                if($Jsline -like "var apiUrl =*")
                { 
                    $oldAPIURL = (([regex]".*'(.*)'").Matches($Jsline))[0].Groups[1].Value
                    if(!$apiUrl)
                    {
                        Write-Host "No url specified! So API deployment url is unchanged."
                    }
                    else {
                        $fileContent = @($fileContent.Replace($oldAPIURL,$newAPIURL))   
                        Write-Host "Updated API url in $Jsfile and value $newAPIURL"
                    }
                }      
               
            }

            $fileContent | Out-File -FilePath $Jsfile
            # Set encoding to encoding in "utf-8"
            $JSFileContent = Get-Content -encoding UTF8 -Raw $Jsfile.FullName
            $encoding = New-Object System.Text.UTF8Encoding
            [System.IO.File]::WriteAllLines($Jsfile.FullName, $JSFileContent, $encoding)
        }
    }
    # Create the Zip file
    compress-archive $folderName "$folderName.zip" -Force
    Write-Host "Created Weblet folder $folderName.zip"
    $WebletZipFilePath = (Get-ChildItem -Filter "$folderName.zip").FullName
    
    $ScriptToRun = (Get-ChildItem -Path $PSScriptRoot -Filter "CopyToAzureBlob.ps1" -Recurse).FullName
    Write-Host "script file path for upload to blob $ScriptToRun"
    &$ScriptToRun -UploadFilePath $WebletZipFilePath -ContainerName "xeroxnoteconverter"
    write-host "End Make weblet Zip "$folderName

}
# Function to start weblet creation based on the weblet type
function MakeWeblet($WebletTypeName,$slotType) {
    write-host "Start Make weblet "$WebletTypeName
    $webletFolder = "$WebletTypeName"
    # Iterates for different slot Values Updates the deployment url and create the weblet for each slot
    $slots = "Dev","Test","Stage","Prod"
    $buildNum = $Env:BUILD_BUILDNUMBER
    $buildNum =$buildNum -replace("\.","")
    Write-Host "Build number is "$buildNum
    if ($slot -eq "all") {
        foreach($slotName in $slots)
        {
            Write-Host "slot is "$slotName
            if ($slotName -eq "Dev")
            {
                $FolderN = $webletFolder+"-"
                $FolderN = "$FolderN$slotName"
                $Passurl = $DeploymentURL-replace("-stage","-dev")
                $PassApiurl = $APIDeploymentURL-replace("-stage","-dev")
                $Version = "$DeploymentVersion.$buildNum"
                MakeWebletZip -folderName $FolderN -redirectURL $Passurl -APIURL $PassApiurl -currentVersion $Version -currentEnvironment $ConfigDev
            }
            if ($slotName -eq "Test")
            {
                $FolderN = $webletFolder+"-"
                $FolderN = "$FolderN$slotName"
                $Passurl = $DeploymentURL-replace("-stage","-test")
                $PassApiurl = $APIDeploymentURL-replace("-stage","-test")
                $Version = "$DeploymentVersion.$buildNum"
                MakeWebletZip -folderName $FolderN -redirectURL $Passurl -APIURL $PassApiurl -currentVersion $Version -currentEnvironment $ConfigTest
            }   
            if ($slotName -eq "Stage")
            {
                $FolderN = $webletFolder+"-"
                $FolderN = "$FolderN$slotName"
                $Version = "$DeploymentVersion.$MinorVersion"
                MakeWebletZip -folderName $FolderN -redirectURL $DeploymentURL -APIURL $APIDeploymentURL -currentVersion $Version -currentEnvironment $ConfigStaging
            } 
            if ($slotName -eq "Prod")
            {
                $FolderN = $webletFolder
                $Passurl = $DeploymentURL-replace("-stage","")
                $PassApiurl = $APIDeploymentURL-replace("-stage","")
                $Version = "$DeploymentVersion.$MinorVersion"
                MakeWebletZip -folderName $FolderN -redirectURL $Passurl -APIURL $PassApiurl -currentVersion $Version -currentEnvironment $ConfigProd
            }   
        }   
    }
    elseif ($slot -like "[tT]est*") {
        $FolderN = $webletFolder+"-"
        $FolderN = "$FolderN"+"Test"
        $Passurl = $DeploymentURL-replace("-stage","-test")
        $PassApiurl = $APIDeploymentURL-replace("-stage","-test")
        $Version = "$DeploymentVersion.$buildNum"
        MakeWebletZip -folderName $FolderN -redirectURL $Passurl -APIURL $PassApiurl -currentVersion $Version -currentEnvironment $ConfigTest
    }
    elseif ($slot -like "[sS]tag*")
    {
        $FolderN = $webletFolder+"-"
        $FolderN = "$FolderN"+"Stage"
        $Version = "$DeploymentVersion.$MinorVersion"
        MakeWebletZip -folderName $FolderN -redirectURL $DeploymentURL -APIURL $APIDeploymentURL -currentVersion $Version -currentEnvironment $ConfigStaging
    } 
    elseif ($slot -like "[pP]rod*")
    {
        $FolderN = $webletFolder
        $Passurl = $DeploymentURL-replace("-stage","")
        $PassApiurl = $APIDeploymentURL-replace("-stage","")
        $Version = "$DeploymentVersion.$MinorVersion"
        MakeWebletZip -folderName $FolderN -redirectURL $Passurl -APIURL $PassApiurl -currentVersion $Version -currentEnvironment $ConfigProd
    } 
    elseif ($slot -like "[dD]ev*")
    {
        $FolderN = $webletFolder+"-"
        $FolderN = "$FolderN"+"Dev"
        $Passurl = $DeploymentURL-replace("-stage","-dev")
        $PassApiurl = $APIDeploymentURL-replace("-stage","-dev")
        $Version = "$DeploymentVersion.$buildNum"
        MakeWebletZip -folderName $FolderN -redirectURL $Passurl -APIURL $PassApiurl -currentVersion $Version -currentEnvironment $ConfigDev
    } 
     write-host "End Make weblet "$WebletTypeName
}
# End of Functions
# :::Main Program Execution Begins here:::
$WebletTypeList = "note"
foreach($typeElement in $WebletTypeList)
{
    if($WebletType -eq $typeElement)
    {
        write-host "Creating weblet "$WebletType
        switch($WebletType)
        {
            "note"{
                $WebletSpecificPath = (Get-ChildItem -Path $Root_Path -Filter "*.Weblet" -Directory -Recurse).FullName 
                MakeWeblet -WebletTypeName "XeroxNoteConverter" -slotType $slot 
            }
           
        }
    }
}
