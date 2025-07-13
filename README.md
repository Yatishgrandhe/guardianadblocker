# Guardian Ad Blocker Extension

A Chrome/Firefox browser extension for blocking ads with a modern UI built using React, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm

### Installation
```bash
npm install
```

### Development
```bash
# Build the extension (CSS + Popup)
npm run build:extension

# Or build separately
npm run build:css    # Build Tailwind CSS
npm run build:popup  # Build React popup
```

### Loading the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the project folder

## 📁 Project Structure

```
guardian-extension/
├── src/
│   ├── App.tsx                 # Main React app
│   ├── components/             # React components
│   └── index.tsx              # Entry point
├── public/
│   ├── popup.html             # Extension popup
│   ├── static-popup.css       # Custom styles
│   └── popup.js               # Built JavaScript
├── app/
│   └── globals.css            # Tailwind CSS input
├── manifest.json              # Extension manifest
├── tailwind.config.ts         # Tailwind configuration
└── vite.popup.config.ts       # Vite build config
```

## 🎨 Styling

The extension uses a combination of:
- **Tailwind CSS**: For utility classes and responsive design
- **Custom CSS**: For extension-specific styling in `static-popup.css`

### CSS Build Process

1. **Tailwind CSS**: Processes `app/globals.css` → `public/popup.css`
2. **Vite**: Bundles React components and generates `public/popup.js`
3. **Custom Styles**: `static-popup.css` contains extension-specific styles

### Available Scripts

- `npm run build:extension` - Build everything
- `npm run build:css` - Build Tailwind CSS only
- `npm run build:popup` - Build React popup only
- `npm run dev:popup` - Development mode for popup

## 🔧 Configuration

### Tailwind Config
The `tailwind.config.ts` includes paths for:
- React components (`src/**/*`)
- HTML files (`public/**/*`)
- All TypeScript/JavaScript files

### Vite Config
The `vite.popup.config.ts` is configured to:
- Output to `public/` directory
- Process CSS with PostCSS and Tailwind
- Bundle React components

## 📝 Notes

- The extension uses Manifest V3
- Content Security Policy (CSP) compliant
- No inline styles - all styling is external CSS
- Responsive design for popup window (320x480px)

## 🐛 Troubleshooting

If styles aren't loading:
1. Run `npm run build:extension`
2. Check that `static-popup.css` is linked in `popup.html`
3. Verify the extension is reloaded in Chrome
4. Check browser console for any errors # guardianadblocker
