# Upload the Zip files as blob to specific blob storage in azure
[CmdletBinding()]
param (
    $ContainerName = "xeroxnoteconverter",
    $UploadFilePath = "C:\GitLocalWorkSpace\XeroxNoteConverter\Azurepipelines\XeroxNoteConverter.zip"
)
Install-Module -Name Az -Force -Scope AllUsers -AllowClobber
$TenantId = "9c2a31bd-e798-488d-986b-90156ac8f29b"
$ApplicationId = "7bec0f2d-36ad-40c0-b331-7e6fa733051d"
$ServicePrincipalKey = ConvertTo-SecureString "lfkDNzSUgrcZ8ULisp+eJx4oOyBzn2FPNMJQHZJ3Thk=" -AsPlainText -Force
$Subscription = "XAS Test"


#Connect to azure account
$AzureADCred = New-Object System.Management.Automation.PSCredential ($ApplicationId, $ServicePrincipalKey)
Connect-AzAccount -Environment AzureCloud -Credential $AzureADCred -ServicePrincipal -TenantId $TenantId -Subscription $Subscription
$WebletSAName = "webletaccount"
$WebletSAKey = "pcqhu9jYhwxEvPvKHY97U6eaSWY/MTIgiobwj2IYcLE/qVXQ2Eg7Nt/OYxTSsmsByb/nhT1nHDyD+AStM4MgBA=="
$StorageContext = New-AzStorageContext -StorageAccountName $WebletSAName `
         -StorageAccountKey $WebletSAKey


# Create the storage container if it does not Exist
if (!(Get-AzStorageContainer -Context $StorageContext | Where-Object { $_.Name -eq $ContainerName }))
{
    New-AzStorageContainer -Name $ContainerName -Context $StorageContext -Permission Blob
}
$BlobName = Split-Path $UploadFilePath -Leaf


# Upload to Blob storage container
Set-AzStorageBlobContent -Container $ContainerName -Blob $BlobName -context $StorageContext -file $UploadFilePath -force

