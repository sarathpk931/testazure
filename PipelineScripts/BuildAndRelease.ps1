# Determine the directory where the script is located
param (
    [string]$outputDirectory,
    [string]$projectRelativePath
)




# Define the project file and configuration
$projectFile = $projectRelativePath
$configuration = "Release"

# Define the target environments and their corresponding build parameters
$environments = @{
    "Development" = "Development"
    "Production"  = "Production"
    "Stage"       = "Stage"
    "Test"        = "Test"
}

# Define the output directory
$outputDirectory = $outputDirectory

#Build the project
Write-Host "Building $projectFile... Configuration $configuration "
dotnet build $projectFile /p:Configuration=$configuration

# Iterate through the environments and build, publish, and package the project
foreach ($env in $environments.GetEnumerator()) {
    $environmentName = $env.Key
    $environmentParam = "/p:EnvironmentName=$($env.Value)"
    $outputFolder = Join-Path -Path $outputDirectory -ChildPath $environmentName

    # Create the output folder if it doesn't exist
    if (-not (Test-Path -Path $outputFolder -PathType Container)) {
        New-Item -Path $outputFolder -ItemType Directory
    }

    # Build the project
    #Write-Host "Building for $environmentName..."
    #dotnet build $projectFile /p:Configuration=$configuration /p:OutputPath=$outputFolder $environmentParam

    # Publish the project
    Write-Host "Publishing for $environmentName..."
    dotnet publish $projectFile -c $configuration -o $outputFolder $environmentParam

    # Package the published files into a zip file
    #$zipFileName = Join-Path -Path $outputDirectory -ChildPath "$environmentName.zip"
    #Write-Host "Creating zip file $zipFileName..."
    #Compress-Archive -Path $outputFolder -DestinationPath $zipFileName -Force

    Write-Host "Build and release for $environmentName completed."
}

Write-Host "All builds and releases completed."
