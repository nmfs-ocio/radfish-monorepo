# RADFish Theming Guide

This guide explains how to customize the look and feel of your RADFish application using USWDS, react-uswds, and RADFish theming.

## Quick Start

All theme customization happens in a single file:

```
themes/noaa-theme/styles/theme.scss
```

This file contains three sections:
1. **USWDS Token Variables** - Design system colors (`$primary`, `$secondary`, etc.)
2. **CSS Custom Properties** - Additional CSS variables (`:root { --noaa-* }`)
3. **Component Overrides** - Custom styles for USWDS components

## How It Works

The RADFish theme plugin:

1. **Parses `theme.scss`** and extracts SCSS `$variables` for USWDS configuration
2. **Pre-compiles USWDS** with your color tokens
3. **Compiles theme.scss** to CSS for custom properties and component overrides
4. **Injects CSS** into your app via `<link>` tags in `index.html`
5. **Watches for changes** and auto-recompiles on save

### Architecture

```
themes/noaa-theme/
├── assets/                    # Icons and logos
│   ├── logo.png              # Header logo
│   ├── favicon.ico           # Browser favicon
│   ├── icon-144.png          # PWA icon
│   ├── icon-192.png          # PWA icon
│   └── icon-512.png          # PWA icon
└── styles/
    └── theme.scss            # All theme configuration (edit this)

node_modules/.cache/radfish-theme/noaa-theme/   # Auto-generated (don't edit)
├── _uswds-entry.scss         # Generated USWDS config
├── uswds-precompiled.css     # Compiled USWDS styles
├── theme.css                 # Compiled theme overrides
└── .uswds-cache.json         # Cache manifest
```

## Section 1: USWDS Token Variables

At the top of `theme.scss`, define SCSS variables that configure the USWDS design system:

```scss
/* themes/noaa-theme/styles/theme.scss */

// Primary colors
$primary: #0055a4;
$primary-dark: #00467f;
$primary-light: #59b9e0;

// Secondary colors
$secondary: #007eb5;
$secondary-dark: #006a99;

// State colors
$error: #d02c2f;
$success: #4c9c2e;
$warning: #ff8300;
$info: #1ecad3;

// Base/neutral colors
$base-lightest: #ffffff;
$base-lighter: #e8e8e8;
$base: #71767a;
$base-darkest: #333333;
```

### Available USWDS Tokens

- **Base**: `base-lightest`, `base-lighter`, `base-light`, `base`, `base-dark`, `base-darker`, `base-darkest`
- **Primary**: `primary-lighter`, `primary-light`, `primary`, `primary-vivid`, `primary-dark`, `primary-darker`
- **Secondary**: `secondary-lighter`, `secondary-light`, `secondary`, `secondary-vivid`, `secondary-dark`, `secondary-darker`
- **Accent Cool**: `accent-cool-lighter`, `accent-cool-light`, `accent-cool`, `accent-cool-dark`, `accent-cool-darker`
- **Accent Warm**: `accent-warm-lighter`, `accent-warm-light`, `accent-warm`, `accent-warm-dark`, `accent-warm-darker`
- **State**: `info`, `error`, `warning`, `success` (with `-lighter`, `-light`, `-dark`, `-darker` variants)
- **Disabled**: `disabled-light`, `disabled`, `disabled-dark`

See [USWDS Design Tokens](https://designsystem.digital.gov/design-tokens/color/theme-tokens/) for complete list.

## Section 2: CSS Custom Properties

Add custom CSS variables in the `:root` block for agency-specific colors:

```scss
/* themes/noaa-theme/styles/theme.scss */

:root {
  // Brand colors
  --noaa-process-blue: #0093D0;
  --noaa-reflex-blue: #0055A4;

  // Regional colors
  --noaa-region-alaska: #FF8300;
  --noaa-region-west-coast: #4C9C2E;
  --noaa-region-southeast: #B2292E;
}
```

Use these in your application CSS:
```css
.region-badge--alaska {
  background-color: var(--noaa-region-alaska);
}
```

### Auto-Generated CSS Variables

The plugin also auto-generates `--radfish-color-*` variables from your USWDS tokens:

- `--radfish-color-primary`
- `--radfish-color-secondary`
- `--radfish-color-error`
- `--radfish-color-success`
- etc.

## Section 3: Component Overrides

At the bottom of `theme.scss`, add custom CSS for USWDS components:

```scss
/* themes/noaa-theme/styles/theme.scss */

/* Header Background */
.usa-header.header-container,
header.usa-header {
  background-color: var(--radfish-color-primary);
}

/* Custom button styles */
.usa-button {
  border-radius: 8px;
  font-weight: 600;
}

/* Custom card styles */
.usa-card {
  border-color: #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

### Available USWDS Components

**Layout & Navigation**: `usa-header`, `usa-footer`, `usa-sidenav`, `usa-breadcrumb`, `usa-banner`

**Forms & Inputs**: `usa-button`, `usa-input`, `usa-checkbox`, `usa-radio`, `usa-select`, `usa-form`

**Content & Display**: `usa-card`, `usa-alert`, `usa-table`, `usa-list`, `usa-accordion`, `usa-tag`

**Interactive**: `usa-modal`, `usa-tooltip`, `usa-pagination`

## Developer Styles

For application-specific styles (not theme-related), use:

```
src/styles/style.css
```

This file is loaded after theme styles, so you can override anything:

```css
/* src/styles/style.css */

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.fish-data-card {
  background: var(--radfish-color-base-lightest);
  border: 1px solid #ddd;
  padding: 1.5rem;
}
```

## Configuration

In `vite.config.js`, configure the app name and description:

```javascript
const configOverrides = {
  app: {
    name: "My App Name",
    shortName: "MyApp",
    description: "App description for PWA",
  },
};

radFishThemePlugin("noaa-theme", configOverrides)
```

The theme name matches the folder in `themes/` directory.

## Changing Assets

Replace files in `themes/noaa-theme/assets/` to customize:

| File | Purpose | Recommended Size |
|------|---------|------------------|
| `logo.png` | Header logo | Height ~48-72px |
| `favicon.ico` | Browser tab icon | 64x64, 32x32, 16x16 |
| `icon-144.png` | PWA icon | 144x144 |
| `icon-192.png` | PWA icon | 192x192 |
| `icon-512.png` | PWA icon/splash | 512x512 |

## Creating a New Theme

1. Create theme folder:
   ```bash
   mkdir -p themes/my-agency/assets themes/my-agency/styles
   ```

2. Add assets to `themes/my-agency/assets/`:
   - `logo.png`, `favicon.ico`, `icon-144.png`, `icon-192.png`, `icon-512.png`

3. Copy and customize the theme file:
   ```bash
   cp themes/noaa-theme/styles/theme.scss themes/my-agency/styles/
   ```

4. Update `vite.config.js`:
   ```javascript
   radFishThemePlugin("my-agency", {
     app: { name: "My Agency App" }
   })
   ```

5. Restart the dev server

## CSS Load Order

Styles are loaded in this order:

1. **uswds-precompiled.css** - USWDS with your color tokens
2. **theme.css** - Your CSS custom properties and component overrides
3. **src/styles/style.css** - Your application styles

This ensures correct CSS cascade: USWDS base → Theme overrides → App styles

## Troubleshooting

### Changes not appearing?

- Save `theme.scss` - the dev server auto-restarts on changes
- Clear browser cache: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Restart dev server: `npm start`

### Styles not applying?

- Check CSS specificity - you may need more specific selectors
- Inspect element in DevTools to see which styles are being applied
- Ensure your selectors match USWDS class names exactly

### Cache issues?

Delete the cache folder and restart:
```bash
rm -rf node_modules/.cache/radfish-theme
npm start
```

## Additional Resources

- [USWDS Design System](https://designsystem.digital.gov/)
- [USWDS Design Tokens](https://designsystem.digital.gov/design-tokens/)
- [USWDS Components](https://designsystem.digital.gov/components/)
- [React USWDS (Trussworks)](https://trussworks.github.io/react-uswds/)
