# SGlass Theme Installer for Spicetify
# Created by Sasuke MC (https://sasukemc.com)
# Execute from PowerShell (Administrator if necessary)

Write-Host "=== SGlass Theme Installer ===" -ForegroundColor Cyan
Write-Host "Created by Sasuke MC (https://sasukemc.com)" -ForegroundColor Blue
Write-Host ""

# Check if Spicetify is installed
try {
    $spicetifyVersion = spicetify -v
    Write-Host "✓ Spicetify detected: $spicetifyVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: Spicetify is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Spicetify first: https://spicetify.app/docs/getting-started" -ForegroundColor Yellow
    exit 1
}

# Get Spicetify themes directory
$spicetifyConfigDir = spicetify -c
$themesDir = Join-Path (Split-Path $spicetifyConfigDir -Parent) "Themes"

Write-Host "📁 Themes directory: $themesDir" -ForegroundColor Blue

# Check if directory exists
if (-not (Test-Path $themesDir)) {
    Write-Host "✗ Error: Spicetify themes directory not found" -ForegroundColor Red
    exit 1
}

# Check if theme already exists
$themeDir = Join-Path $themesDir "SGlass"
if (Test-Path $themeDir) {
    $overwrite = Read-Host "SGlass theme already exists. Overwrite? (y/N)"
    if ($overwrite -notmatch '^[Yy]$') {
        Write-Host "Installation cancelled." -ForegroundColor Yellow
        exit 0
    }
    Remove-Item $themeDir -Recurse -Force
    Write-Host "✓ Previous theme removed" -ForegroundColor Green
}

# Download theme files from GitHub
Write-Host "📥 Downloading theme files..." -ForegroundColor Blue

try {
    # Create theme directory
    New-Item -ItemType Directory -Path $themeDir -Force | Out-Null
    
    # Base URL for raw files
    $baseUrl = "https://raw.githubusercontent.com/sasukemc7/sglass-spicetify/main"
    
    # Download theme files
    $files = @("user.css", "theme.js", "color.ini", "manifest.json")
    
    foreach ($file in $files) {
        $url = "$baseUrl/$file"
        $destination = Join-Path $themeDir $file
        Write-Host "Downloading $file..." -ForegroundColor Gray
        Invoke-WebRequest -Uri $url -OutFile $destination -UseBasicParsing
    }
    
    Write-Host "✓ Theme files downloaded successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Error downloading theme files: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎨 Applying SGlass theme..." -ForegroundColor Cyan

try {
    # Configure theme
    spicetify config current_theme SGlass
    Write-Host "✓ Theme configured" -ForegroundColor Green
    
    # Apply changes
    spicetify apply
    Write-Host "✓ Changes applied" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🎉 SGlass installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Restart Spotify if it's open" -ForegroundColor White
    Write-Host "2. Look for the 🎨 button in the top bar" -ForegroundColor White
    Write-Host "3. Customize options according to your preferences" -ForegroundColor White
    Write-Host "4. Enjoy the liquid glass effects!" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Tip: Enable 'Dynamic song colors' for the best experience" -ForegroundColor Cyan
    Write-Host "🌐 Support: https://sasukemc.com" -ForegroundColor Blue
    
} catch {
    Write-Host "✗ Error applying theme: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Try running 'spicetify apply' manually" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")