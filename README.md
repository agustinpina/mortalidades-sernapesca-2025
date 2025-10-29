# Chilean Salmon Mortality Data Visualization

An interactive, accessible D3.js-based web application for visualizing and analyzing salmon mortality trends across Chilean regions, species, and time periods (2024-2025).

## Overview

This project provides a comprehensive visualization tool for exploring Chilean salmon aquaculture mortality data from Sernapesca. The interface features a modern three-column layout with dynamic filtering, year-over-year comparisons, and interactive charts, designed with full WCAG 2.1 AA accessibility compliance.

## Features

### Core Functionality
- **Interactive Multi-Line Chart**: D3.js powered visualization with smooth transitions and animations
- **Three-Column Layout**: Chart (left), Current Selection (middle), Filter Panel (right/modal on mobile)
- **Year-Over-Year Comparison**: Overlay 2024 and 2025 data with different line styles (solid vs dashed)
- **Dynamic Filtering**: Hierarchical filter system (Species → Region → Year → Metric Type → Causes)
- **Dual Y-Axis Modes**: Switch between absolute counts and percentages
- **6-Line Maximum**: Automatic limiting with visual warnings when exceeded
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Full Accessibility**: WCAG 2.1 AA compliant with screen reader support, keyboard navigation, and ARIA attributes

### Data Metrics
- **Total Mortality**: Overall mortality counts across all causes (cannot be combined with percentage scale)
- **Primary Causes**: 10 primary mortality categories (predators, environmental, disease, mechanical damage, etc.)
- **Secondary Diseases**: 20 specific disease types (SRS/Piscirickettsiosis, ISA, BKD, IPN, etc.)

### Data Validation
- **Scale Validation**: "Total Mortality" cannot be displayed with "Percentage Scale" (would always be 100%)
- **Auto-switching**: System automatically adjusts incompatible selections with user notification
- **Visual Feedback**: Warning messages appear when 6-line limit is exceeded

### Interactivity
- **Hover Tooltips**: Detailed information on data points with ARIA live regions
- **Line Highlighting**: Hover to emphasize specific series
- **Data Point Enlargement**: Enhanced visibility on hover
- **Keyboard Navigation**: Full keyboard support with skip links and focus management
- **URL Sharing**: Share filtered views via URL parameters
- **Download Options**: Export charts as PNG or SVG

### Accessibility Features (WCAG 2.1 AA)
- **Screen Reader Support**: Proper ARIA labels, roles, and live regions
- **Keyboard Navigation**: All functionality accessible via keyboard
- **Skip Links**: Bypass navigation to main content
- **Focus Indicators**: Clear visual focus indicators for all interactive elements
- **Semantic HTML**: Proper use of landmarks, headings, labels, and form controls
- **Alt Text**: Descriptive labels for all non-text content
- **Color Independence**: Information not conveyed by color alone

## Project Structure

```
mortalidades_sernapesca_2025/
├── index.html                 # Main HTML structure (semantic, accessible)
├── css/
│   └── styles.css            # Complete styling (Sernapesca palette, focus indicators)
├── js/
│   ├── config.js             # Application configuration (DEBUG mode)
│   ├── main.js               # Application orchestration
│   ├── dataLoader.js         # CSV loading and parsing
│   ├── dataTransformer.js    # Data filtering and transformation
│   ├── filters.js            # Filter panel UI management (ARIA state)
│   └── chart.js              # D3.js chart rendering
├── data/
│   └── datos_summary.csv     # Aggregated mortality data (641 rows)
├── CLAUDE.md                 # Developer documentation
└── README.md                 # This file
```

## Getting Started

### Prerequisites
- Modern web browser with ES6+ support (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Local web server (required for CORS compliance)

### Installation

1. **Clone or download this repository**
   ```bash
   cd /path/to/mortalidades_sernapesca_2025
   ```

2. **Start a local web server**

   **Option 1: Python 3 (Recommended)**
   ```bash
   python3 -m http.server 8080
   ```

   **Option 2: Node.js**
   ```bash
   npx http-server -p 8080
   ```

   **Option 3: PHP**
   ```bash
   php -S localhost:8080
   ```

3. **Open in browser**
   ```
   http://localhost:8080
   ```

   **Important**: The application MUST be served via HTTP server (not `file://` protocol) due to CORS restrictions when loading CSV files.

## Usage Guide

### Default View
When you first load the application:
- **Species**: Salmón Atlántico (Atlantic Salmon)
- **Regions**: X Región, XI Región, XII Región (all three default regions)
- **Years**: 2024 and 2025
- **Metric**: Total Mortality
- **Scale**: Absolute Count
- **Result**: 6 lines showing mortality trends across regions and years

### Filter Panel

The filter panel (accessible via "Filtros" button or right column on desktop) provides hierarchical filtering:

1. **Tipo de Métrica** (Metric Type)
   - Mortalidad Total: Overall mortality counts
   - Causas Primarias: Select from 10 primary categories
   - Enfermedades Secundarias: Select from 20 specific diseases

2. **Escala del Eje Y** (Y-Axis Scale)
   - Conteo Absoluto: Raw mortality numbers
   - Porcentaje (%): Relative contribution (disabled for Total Mortality)

3. **Especie** (Species)
   - Salmón Atlántico
   - Trucha arcoíris
   - Salmón coho

4. **Región** (Region)
   - X Región (Los Lagos)
   - XI Región (Aisén)
   - XII Región (Magallanes)

5. **Año** (Year)
   - 2024 (solid lines)
   - 2025 (dashed lines)

6. **Causas/Enfermedades** (Causes/Diseases)
   - Appears when Metric Type is set to Primary or Secondary
   - Select specific causes to display

### Keyboard Navigation

- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons and toggle checkboxes
- **Escape**: Close filter panel (when open)
- **Skip Link**: Press Tab on page load to skip to main content

### Chart Interactions

- **Hover over lines**: Highlight the series and dim others
- **Hover over data points**: Display detailed tooltip with:
  - Species, Region, Year
  - Week number and month
  - Mortality value
- **Download Button**: Choose PNG or SVG export format
- **Share Button**: Copy current filter state to URL for sharing
- **Reset Filters**: Return to default view
- **Clear Selection**: Remove all current selections

## Data Validation Rules

### Scale Type Restrictions

The application enforces the following validation:

1. **"Total Mortality" cannot use "Percentage Scale"**
   - Reason: Total mortality as a percentage of itself is always 100%, providing no useful information
   - Behavior: Selecting percentage scale auto-switches metric to "Primary Causes"
   - User Notification: Console log (in DEBUG mode) explains the auto-switch

2. **"Percentage Scale" cannot use "Total Mortality"**
   - Behavior: Selecting Total Mortality auto-switches scale to "Absolute Count"
   - User Notification: Console log (in DEBUG mode) explains the auto-switch

### Line Limit

- **Maximum**: 6 lines displayed simultaneously
- **Enforcement**: Top 6 series by total mortality are shown
- **Warning**: Yellow warning message appears when limit exceeded
- **Accessible**: Warning has `role="alert"` for screen readers

## Styling Guidelines

### Color Palette (Official Sernapesca)

The application uses the official Sernapesca color palette with enhanced contrast:

```css
--chart-color-1: #081935;  /* Dark Navy Blue */
--chart-color-2: #1939B7;  /* Navy Blue */
--chart-color-3: #7076E8;  /* Periwinkle Blue */
--chart-color-4: #009BE1;  /* Sky Blue */
--chart-color-5: #74D0C7;  /* Aquamarine */
--chart-color-6: #B8E4F2;  /* Pale Baby Blue */
```

### Button and Control Consistency

All interactive elements follow a consistent design pattern:

- **Icon Buttons**: Borderless with hover effects (Download, Share, Reset, Close)
- **Primary Button**: Filter toggle with solid background
- **Select Dropdowns**: Custom styled to match icon button aesthetic
- **Focus Indicators**: 3px solid blue outline with 2px offset

### Line Styles

- **2024 Data**: Solid lines (2.5px width)
- **2025 Data**: Dashed lines (5px dash, 5px gap)
- **Highlighted**: Increased to 3.5px width
- **Point Radius**: 3.5px default, 6px on hover

## Technical Architecture

### Module System

The application uses ES6 modules with clear separation of concerns:

```javascript
// Data Flow
DataLoader → DataTransformer → FilterManager ↔ MortalityChart
                                     ↓
                               Filter State
                                     ↓
                             Series Generation
                                     ↓
                              D3.js Rendering
```

### Key Components

**config.js**
- DEBUG mode flag for development logging
- Centralized configuration

**main.js (MortalityDashboard)**
- Application orchestrator
- Manages filter state via callback pattern
- Handles URL state for sharing
- Focus management for accessibility

**dataLoader.js (DataLoader)**
- Loads CSV from `data/` folder using d3.csv()
- Parses timepoint strings (regex: `/Semana (\d+) - \w+ (\d{4})/`)
- Converts mortality fields to numbers
- Provides metadata methods (getSpecies, getRegions, etc.)

**dataTransformer.js (DataTransformer)**
- Filters data based on hierarchical filter state
- Two transformation modes: total mortality vs cause-specific
- Converts absolute values to percentages when needed
- Enforces 6-line maximum via `limitSeries()`
- Assigns colors from Sernapesca palette
- Assigns line styles based on year

**filters.js (FilterManager)**
- Manages filter panel UI state
- Hierarchical filter structure with validation
- ARIA state management (aria-expanded, aria-hidden)
- Focus management (dialog pattern)
- Updates selection list with color swatches

**chart.js (MortalityChart)**
- D3.js visualization component
- SVG architecture with layered groups
- X-scale: linear 1-52 (weeks)
- Y-scale: auto-ranging with 10% padding
- Line generator with curveMonotoneX
- Accessible tooltips with ARIA live regions
- PNG/SVG export functionality

### Constants and Magic Numbers

All magic numbers have been extracted to named constants:

```javascript
// Chart constants (chart.js)
CHART_MARGINS = { top: 40, right: 40, bottom: 60, left: 80 }
POINT_RADIUS_DEFAULT = 3.5
POINT_RADIUS_HOVER = 6
TRANSITION_FAST = 150ms
TRANSITION_TOOLTIP = 200ms
TRANSITION_NORMAL = 300ms
TRANSITION_SLOW = 500ms
```

### Performance Optimizations

- **DEBUG Mode**: All console.log statements wrapped in `if (CONFIG.DEBUG)` conditional
- **Removed Dead Code**: Unused percentage data loading eliminated
- **Single Data Source**: Only loads datos_summary.csv (641 rows)
- **Load Time**: ~200-500ms
- **Render Time**: ~300-500ms per filter change
- **Smooth Animations**: 60 FPS transitions

## Code Quality Standards

### Recent Improvements

The codebase has undergone comprehensive quality reviews:

1. **Naming Convention Consistency**
   - Changed `serie` to `seriesItem` for clarity
   - Consistent use of single quotes throughout
   - Proper variable naming (no magic strings)

2. **Dead Code Removal**
   - Removed unused CSS variables (chart-color-7, chart-color-8)
   - Removed dead CSS classes (.current-selection, .filter-sections, .results-count)
   - Removed unused loadStateFromURL() function
   - Removed empty hideLoading() method
   - Removed dead settings-toggle event listener

3. **Semantic HTML**
   - Proper use of `<fieldset>` and `<legend>` for form groups
   - `<label>` elements properly associated with all inputs
   - Correct heading hierarchy (h1 → h2 → legend)
   - Semantic landmarks (main, nav, footer, aside)

4. **Accessibility Enhancements**
   - All SVG icons have `aria-hidden="true"`
   - Filter panel has proper dialog semantics
   - Live regions for dynamic content updates
   - Skip link for keyboard users
   - Comprehensive focus indicators
   - Proper ARIA state management

5. **Form Accessibility**
   - All dynamically generated inputs have unique IDs
   - Labels properly associated via `for` attribute
   - Fieldsets group related checkboxes
   - Select dropdowns have label elements

## Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Requirements
- ES6+ module support
- D3.js v7 compatibility
- CSS Grid and Flexbox support
- CSS custom properties (variables)
- :focus-visible pseudo-class

## Customization

### Changing Default Filters

Edit `js/filters.js` (lines 12-19):

```javascript
this.state = {
    species: ['Salmón Atlántico'],
    regions: ['X Región', 'XI Región', 'XII Región'],
    years: [2024, 2025],
    metricType: 'total',
    selectedCauses: [],
    scaleType: 'absolute'
};
```

### Modifying Colors

Edit `css/styles.css` (lines 26-31):

```css
--chart-color-1: #081935;
--chart-color-2: #1939B7;
/* ... etc */
```

Or modify in `js/dataTransformer.js` (lines 36-42):

```javascript
this.officialColors = [
    '#081935',
    '#1939B7',
    // ... etc
];
```

### Adjusting Chart Dimensions

Edit chart margins in `js/chart.js` (line 20):

```javascript
this.CHART_MARGINS = { top: 40, right: 40, bottom: 60, left: 80 };
```

Edit chart height in `css/styles.css`:

```css
.chart-area {
    min-height: 500px; /* Adjust as needed */
}
```

### Enabling Debug Mode

Edit `js/config.js`:

```javascript
export const CONFIG = {
    DEBUG: true  // Set to true for development logging
};
```

## Troubleshooting

### Chart doesn't load
- **Check**: Browser console for errors
- **Solution**: Ensure running via HTTP server (not `file://`)
- **Verify**: CSV files exist in `data/` folder

### Data not showing
- **Check**: Network tab for failed CSV requests
- **Solution**: Verify path in `dataLoader.js` (line 17)
- **Check**: Browser console for parsing errors

### CORS errors
- **Solution**: Must use HTTP server (Python, Node.js, PHP)
- **Not supported**: Opening index.html directly in browser

### Filters not working
- **Check**: Browser console for JavaScript errors
- **Verify**: All .js files are loading (check Network tab)
- **Solution**: Clear browser cache and reload

### Accessibility issues
- **Test**: Run axe DevTools browser extension
- **Test**: Use WAVE accessibility evaluation tool
- **Test**: Navigate with keyboard only
- **Test**: Use screen reader (NVDA, JAWS, VoiceOver)

## Development Guidelines

### Adding New Filters

1. Add state property in `filters.js` constructor
2. Create HTML in `index.html` (use `<fieldset>` for checkboxes)
3. Add population method in FilterManager
4. Add event listener in `initializeEventListeners()`
5. Update `DataTransformer.filterData()` to apply filter
6. Update URL encoding in `main.js`

### Modifying Chart Appearance

- **Line width**: Edit `LINE_WIDTH_DEFAULT` constant in `chart.js`
- **Point size**: Edit `POINT_RADIUS_DEFAULT` constant in `chart.js`
- **Colors**: Edit `officialColors` array in `dataTransformer.js`
- **Transitions**: Edit `TRANSITION_*` constants in `chart.js`

### Maintaining Accessibility

When adding new features:
- Add `aria-label` to icon-only buttons
- Use `role="status"` for dynamic text updates
- Use `role="alert"` for important notifications
- Ensure all form inputs have associated labels
- Test keyboard navigation (Tab, Enter, Escape)
- Add focus indicators for new interactive elements
- Update ARIA attributes dynamically in JavaScript

## Data Sources

### Active Data File

**datos_summary.csv**
- **Rows**: 641 observations
- **Aggregation**: By region × species × week
- **Fields**: All mortality categories (total, primary, secondary)
- **Timepoint Format**: `"Semana {1-52} - {Month} {2024|2025}"`

### Data Processing

The CSV is processed on load:
1. Parse timepoint string to extract week number and year
2. Convert all mortality fields from strings to numbers
3. Add computed fields: `seriesId`, `displayLabel`, `week`, `year`, `month`
4. Store in DataLoader for filtering and transformation

## Credits

- **Data Source**: Sernapesca (Chilean National Fisheries and Aquaculture Service)
- **Color Palette**: Official Sernapesca branding guidelines
- **Visualization Library**: D3.js v7
- **Accessibility Standards**: WCAG 2.1 AA
- **Developer**: Agustín Pina

## License

CC-BY | Sernapesca 2024-2025

## Changelog

### Version 2.0.0 (2025-10-29)
- **Layout**: Implemented three-column responsive layout
- **Accessibility**: Full WCAG 2.1 AA compliance
  - Screen reader support with ARIA attributes
  - Keyboard navigation and skip links
  - Focus management and indicators
  - Semantic HTML with proper form labels
- **Code Quality**: Comprehensive cleanup
  - Removed dead code and unused files
  - Extracted magic numbers to constants
  - DEBUG mode for development logging
  - Consistent naming conventions
- **Data Validation**: Enforced scale type restrictions
- **UI Improvements**: Enhanced filter panel with dialog semantics
- **Performance**: Optimized data loading (single CSV source)

### Version 1.0.0 (2025-10-27)
- Initial release
- Basic filtering and visualization
- Year-over-year comparison
- Download and share functionality

---

## Additional Resources

- **Developer Documentation**: See [CLAUDE.md](CLAUDE.md) for technical details and architecture
- **Live Demo**: `http://localhost:8080` (after starting local server)
- **Browser DevTools**: Use for debugging and accessibility testing
- **D3.js Documentation**: https://d3js.org/
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

For questions or contributions, please refer to the project repository.
