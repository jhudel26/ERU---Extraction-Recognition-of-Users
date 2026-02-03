# ERU - Extraction & Recognition of Users

A Chrome extension that automatically extracts user names from Facebook group pages.

## Features

- **Automatic Extraction**: Automatically scrolls through group members and extracts all names
- **Smart Detection**: Uses multiple methods to find names in Facebook's HTML structure
- **Export Options**: Copy to clipboard or download as text file
- **Real-time Progress**: Shows extraction progress with live updates
- **No Server Required**: Works entirely in your browser
- **Privacy-focused**: Data never leaves your computer

## Installation

### Chrome/Edge:
1. Download the extension files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `extension` folder
6. The extension is now installed!

### Firefox:
1. Download the extension files
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file
6. The extension is now installed!

## How to Use

1. **Navigate to Facebook**: Go to any Facebook group
2. **Go to Members**: Click on the "Members" tab in the group
3. **Start Extraction**: Click the blue floating "Extract Users" button
4. **Wait**: The extension will automatically scroll and extract names
5. **Export Results**: Copy names to clipboard or download as text file

## Extension Files

- `manifest.json` - Extension configuration and permissions
- `content.js` - Main extraction logic (ERUExtractor class) that runs on Facebook pages
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality
- `background.js` - Background service worker
- `styles.css` - Styles for the extraction interface
- `icons/` - Extension icons (you'll need to add these)

## Adding Icons

Create or download icons for the extension:
- `icon16.png` - 16x16 pixels
- `icon32.png` - 32x32 pixels  
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

Place them in the `icons/` folder.

## How It Works

The extension uses multiple extraction methods:

1. **Link Analysis**: Finds `<a>` tags with `/groups/` and `/user/` in href attributes
2. **Aria-label Extraction**: Checks aria-label attributes for names
3. **Text Content Parsing**: Analyzes specific div and span elements
4. **Pattern Matching**: Filters out non-name content using regex patterns

## Privacy & Security

- ✅ No data sent to external servers
- ✅ Works entirely in your browser
- ✅ No tracking or analytics
- ✅ Open source code
- ⚠️ Only works on Facebook group members pages
- ⚠️ Requires Facebook login to access group data

## Troubleshooting

**Extension not working?**
1. Make sure you're on a Facebook group members page
2. Refresh the page after installing the extension
3. Check that Developer mode is enabled
4. Look for the floating blue button

**No names extracted?**
1. Ensure you're on the "Members" tab of a Facebook group
2. Wait for the page to fully load
3. Try scrolling manually first, then click extract
4. Check if the group has visible members

**Extraction stops early?**
1. The extension stops when no new content loads
2. Try running it again - it will add any new names found
3. Some groups may have rate limits

## Compatibility

- ✅ Chrome (Manifest V3)
- ✅ Edge (Chromium-based)
- ✅ Firefox (with minor modifications)
- ✅ Opera (Chromium-based)

## Legal Notice

This extension is for educational and personal use only. Users are responsible for:
- Complying with Facebook's Terms of Service
- Respecting privacy of group members
- Using extracted data ethically and legally

## Development

To modify the extension:
1. Edit the source files
2. Go to `chrome://extensions/`
3. Click the refresh button on your extension
4. Test changes on a Facebook group page

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Ensure you have the latest version
3. Test on different Facebook groups
4. Report issues with details about the problem

---

**Disclaimer**: This tool is provided as-is. Users are responsible for complying with all applicable laws and platform terms of service.
