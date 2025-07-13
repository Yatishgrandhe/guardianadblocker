# Guardian Ad Blocker - Testing Guide

## Overview
Guardian Ad Blocker is a comprehensive browser extension that blocks ads, popups, and tracking scripts while providing detailed statistics about blocked content.

## Features to Test

### 1. Ad Blocking
- **Network-level blocking**: Uses Chrome's declarativeNetRequest API
- **Cosmetic filtering**: CSS-based element hiding
- **JavaScript blocking**: Prevents ad scripts from loading

### 2. Statistics Tracking
- **Real-time counting**: Tracks blocked ads by type (banner, video, popup, redirect, other)
- **Domain tracking**: Shows which domains had the most ads blocked
- **Per-tab statistics**: Tracks blocked ads for each tab separately
- **Persistent storage**: Statistics are saved and persist across browser sessions

### 3. User Interface
- **Modern design**: Clean, dark theme with gradient backgrounds
- **Toggle controls**: Enable/disable global and per-site blocking
- **Statistics view**: Detailed breakdown of blocked content
- **Real-time updates**: Statistics update as ads are blocked

## Testing Steps

### Step 1: Install the Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" and select the extension folder
4. Verify the extension appears in your extensions list

### Step 2: Test Basic Functionality
1. Open the test page: `test-ad-blocking.html` (included in the extension folder)
2. Check that ad elements are hidden (banner ads, video ads, etc.)
3. Click the extension icon to open the popup
4. Verify the statistics show blocked ads

### Step 3: Test Statistics Tracking
1. Visit websites with ads (e.g., news sites, YouTube)
2. Open the extension popup and switch to the Statistics view
3. Verify that:
   - Total blocked count increases
   - Different ad types are categorized correctly
   - Domain statistics are updated
   - Last update time is shown

### Step 4: Test Toggle Controls
1. In the extension popup, toggle "Global Blocking" off
2. Refresh a page with ads - ads should now appear
3. Toggle "Global Blocking" back on
4. Refresh the page - ads should be blocked again

### Step 5: Test Per-Site Blocking
1. Visit a specific website
2. In the extension popup, toggle "Site Blocking" for that site
3. Verify that ads are blocked/not blocked based on the setting

## Test Websites

### Good Test Sites:
- **YouTube**: Video ads, banner ads, sponsored content
- **News sites**: Banner ads, popup ads
- **Adblock-tester.com**: Specifically designed to test ad blockers
- **HiAnime.to**: Streaming site with various ad types

### Expected Behavior:
- **Banner ads**: Hidden with CSS
- **Video ads**: Blocked at network level or hidden with CSS
- **Popup ads**: Prevented from opening
- **Tracking scripts**: Blocked from loading
- **Analytics**: Google Analytics, Facebook Pixel, etc. blocked

## Troubleshooting

### Extension Not Working:
1. Check Chrome's extension page for errors
2. Open Developer Tools (F12) and check Console for errors
3. Verify the extension is enabled
4. Check that all permissions are granted

### Statistics Not Updating:
1. Ensure the background script is running
2. Check that content scripts are injected
3. Verify storage permissions are granted
4. Check console for message passing errors

### Ads Still Appearing:
1. Verify global blocking is enabled
2. Check if the site has specific blocking disabled
3. Some ads may use advanced techniques that require additional rules
4. Check the rules.json file for comprehensive blocking rules

## File Structure
```
guardian-extension/
├── manifest.json              # Extension configuration
├── background.js              # Background service worker
├── rules.json                 # Network blocking rules
├── src/
│   └── contentScript.js       # Content script for cosmetic filtering
├── public/
│   ├── popup.html             # Popup interface
│   ├── popup.js               # Popup logic
│   └── static-popup.css       # Popup styling
└── icons/                     # Extension icons
```

## Statistics Categories

The extension tracks blocked content in these categories:
- **Banner**: Traditional banner advertisements
- **Video**: Video ads, YouTube ads, streaming ads
- **Popup**: Popup windows, modal dialogs
- **Redirect**: Redirect links, affiliate links
- **Other**: Analytics, tracking scripts, miscellaneous

## Performance Notes
- The extension uses efficient CSS selectors for cosmetic filtering
- Network requests are blocked at the browser level for better performance
- Statistics are updated in real-time without impacting page performance
- Memory usage is optimized for long-running sessions

## Support
If you encounter issues:
1. Check the browser console for error messages
2. Verify all files are present and properly built
3. Test on different websites to isolate issues
4. Check that the extension has all required permissions 