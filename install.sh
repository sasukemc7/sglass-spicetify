#!/bin/bash

# SGlass Theme Installer for Spicetify
# Created by Sasuke MC (https://sasukemc.com)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_message() {
    echo -e "${GREEN}[SGlass]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[SGlass]${NC} $1"
}

print_error() {
    echo -e "${RED}[SGlass]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[SGlass]${NC} $1"
}

# Check if Spicetify is installed
check_spicetify() {
    if ! command -v spicetify &> /dev/null; then
        print_error "Spicetify is not installed or not in PATH."
        print_info "Please install Spicetify first: https://spicetify.app/docs/getting-started/"
        exit 1
    fi
    
    # Check Spicetify version
    SPICETIFY_VERSION=$(spicetify -v | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
    print_info "Spicetify version: $SPICETIFY_VERSION"
}

# Get Spicetify config directory
get_spicetify_dir() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        SPICETIFY_DIR="$HOME/.config/spicetify"
    else
        # Linux and others
        SPICETIFY_DIR="$HOME/.config/spicetify"
    fi
    
    THEMES_DIR="$SPICETIFY_DIR/Themes"
    SGLASS_DIR="$THEMES_DIR/SGlass"
}

# Create directories if they don't exist
create_directories() {
    if [[ ! -d "$THEMES_DIR" ]]; then
        print_info "Creating themes directory..."
        mkdir -p "$THEMES_DIR"
    fi
}

# Download and install theme
install_theme() {
    print_message "Installing SGlass theme..."
    
    # Remove existing installation
    if [[ -d "$SGLASS_DIR" ]]; then
        print_warning "Removing existing SGlass installation..."
        rm -rf "$SGLASS_DIR"
    fi
    
    # Create theme directory
    mkdir -p "$SGLASS_DIR"
    
    # Download theme files
    print_info "Downloading theme files..."
    
    # Download main files
    curl -fsSL "https://raw.githubusercontent.com/sasukemc/sglass-spicetify/main/user.css" -o "$SGLASS_DIR/user.css"
    curl -fsSL "https://raw.githubusercontent.com/sasukemc/sglass-spicetify/main/theme.js" -o "$SGLASS_DIR/theme.js"
    curl -fsSL "https://raw.githubusercontent.com/sasukemc/sglass-spicetify/main/color.ini" -o "$SGLASS_DIR/color.ini"
    curl -fsSL "https://raw.githubusercontent.com/sasukemc/sglass-spicetify/main/manifest.json" -o "$SGLASS_DIR/manifest.json"
    
    print_message "Theme files downloaded successfully!"
}

# Apply theme
apply_theme() {
    print_info "Applying SGlass theme..."
    
    # Backup current config
    spicetify backup apply
    
    # Configure theme
    spicetify config current_theme SGlass
    spicetify config inject_css 1
    spicetify config replace_colors 1
    spicetify config overwrite_assets 1
    
    # Apply theme
    spicetify apply
    
    print_message "SGlass theme applied successfully!"
}

# Add required patches
add_patches() {
    print_info "Adding required patches..."
    
    # Add sidebar patch for proper display
    spicetify config xpui.js_find_8008 ',(\w+=)32,'
    spicetify config xpui.js_repl_8008 ',${1}56,'
    
    print_message "Patches added successfully!"
}

# Main installation function
main() {
    print_message "SGlass Theme Installer"
    print_info "Created by Sasuke MC (https://sasukemc.com)"
    echo ""
    
    # Check prerequisites
    check_spicetify
    
    # Get directories
    get_spicetify_dir
    
    # Create directories
    create_directories
    
    # Install theme
    install_theme
    
    # Add patches
    add_patches
    
    # Apply theme
    apply_theme
    
    echo ""
    print_message "Installation completed successfully!"
    print_info "You can access theme settings by clicking the 🎨 button in Spotify's top bar."
    print_info "For support, visit: https://sasukemc.com"
    print_warning "If you encounter any issues, try running: spicetify backup apply"
}

# Run main function
main