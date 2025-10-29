# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A D3.js-based interactive web application for visualizing Chilean salmon mortality data from Sernapesca (2024-2025). The application features a three-column responsive layout, dynamic filtering, year-over-year comparisons, full WCAG 2.1 AA accessibility compliance, multi-series line charts, and a share modal with LinkedIn integration.

**Content Language**: Spanish (España) - All UI text, titles, and descriptions are in Spanish.

**No build process required** - this is a vanilla JavaScript ES6+ application that runs directly in the browser.

## Running the Application

Start a local web server from the project root:

```bash
# Python 3 (recommended)
python3 -m http.server 8080

# Alternative: Node.js
npx http-server -p 8080

# Alternative: PHP
php -S localhost:8080
```

Then open `http://localhost:8080` in a browser.

**Important**: The application MUST be served via HTTP server (not `file://` protocol) due to CORS restrictions when loading CSV files.

## Architecture Overview

### Three-Column Layout

The application uses a responsive three-column layout:

1. **Left Column** (Chart Container):
   - Main D3.js visualization
   - Chart title with results count
   - Filter toggle button (mobile)
   - Download and share buttons (footer)

2. **Middle Column** (Current Selection):
   - Interactive list of selected series with color swatches
   - **Soft deselection**: Click any series to toggle visibility (show/hide on chart)
   - Eye icon indicators: open eye (visible) / crossed eye (hidden)
   - Grayed-out appearance for hidden series (60% opacity)
   - Selection count shows total series (regardless of visibility)
   - Clear selection button
   - Visible on desktop, stacks below chart on mobile/tablet
   - Fully keyboard accessible (Tab + Enter/Space to toggle)

3. **Right Column** (Filter Panel):
   - Hierarchical filter controls
   - Modal dialog on mobile/tablet
   - Fixed column on desktop (400px default width)
   - **Dynamic expansion**: Expands to 600px when Primary or Secondary Causes are selected
   - Accessible via keyboard (Escape to close)

### Data Flow Pipeline

```
CSV File → DataLoader → DataTransformer → FilterManager ↔ MortalityChart
                             ↓
                        Filter State
                             ↓
                       Series Generation
                             ↓
                        D3.js Rendering
```

### Module Responsibilities

**config.js**
- Centralized configuration
- DEBUG flag for development logging
- Set `DEBUG: true` to enable console.log statements

**main.js (MortalityDashboard & ModalManager)**
- **MortalityDashboard**: Application orchestrator
  - Coordinates all modules via dependency injection
  - Handles filter state changes through callback pattern
  - Manages URL state for sharing (`updateURL()`)
  - Focus management for accessibility (panel open/close)
  - ARIA state updates (aria-expanded, aria-hidden)
  - Entry point: instantiated on `DOMContentLoaded`
  - **Download button**: Shows "Próximamente" (Coming Soon) notification with animated pill
  - **Share button**: Opens modal with copy link and LinkedIn CTA
  - **Soft deselection**: `toggleSeriesVisibility(seriesId)` method
    - Stores series with `visible` property (default: true)
    - Preserves visibility state when filters change
    - Only renders visible series to chart
    - Updates selection list with toggle callbacks
- **ModalManager**: Share modal handler
  - Opens/closes share modal with accessibility support
  - Focus trap and Escape key handling
  - Copy to clipboard functionality with visual feedback
  - Returns focus to trigger element on close
  - Prevents body scroll when modal is open

**dataLoader.js (DataLoader)**
- Loads CSV file from `data/` folder using `d3.csv()`
- **Single source**: Only loads `datos_summary.csv` (percentage data loading removed)
- Parses timepoint strings to extract week number and year via regex: `/Semana (\d+) - \w+ (\d{4})/`
- Converts all mortality fields from CSV strings to numbers
- Adds computed fields: `seriesId`, `displayLabel`, `week`, `year`, `month`
- Provides metadata methods: `getSpecies()`, `getRegions()`, `getPrimaryCauses()`, `getSecondaryDiseases()`
- Error handling: Includes original error message in thrown error

**dataTransformer.js (DataTransformer)**
- Filters raw data based on hierarchical filter state
- Transforms filtered data into chart-ready series objects
- Handles two transformation modes:
  - Total mortality: groups by `species × region × year`
  - Cause-specific: creates series for each `cause × species × region × year`
- Converts absolute values to percentages when `scaleType === 'percentage'`
- Enforces 6-line maximum via `limitSeries()` (sorts by total mortality, returns top 6)
- Assigns colors from official Sernapesca palette (6 colors)
- Assigns line styles: solid for 2024, dashed for 2025
- Uses `seriesItem` variable (renamed from `serie` for consistency)

**filters.js (FilterManager)**
- Manages filter panel UI state
- Hierarchical filter structure: Species → Region → Year → Metric Type → Causes
- **Default state**: Atlantic Salmon, all three regions (X, XI, XII), both years, total mortality
- **Terminology**: Uses "Causas Secundarias" (Secondary Causes), not "Enfermedades Secundarias"
- **Data validation**: Enforces scale type restrictions:
  - "Total Mortality" cannot use "Percentage Scale" (auto-switches to Absolute)
  - "Percentage Scale" cannot use "Total Mortality" (auto-switches to Primary Causes)
- Dynamically shows/hides cause sections based on metric type
- **Dynamic panel expansion**: Adds `.expanded` class when Primary/Secondary Causes selected
  - Default width: 400px
  - Expanded width: 600px
  - Smooth CSS transition between states
- Uses event delegation for checkbox/select change events
- Invokes callback (`onFilterChange`) on any state change
- **Interactive selection list** (`updateSelectionList(series, onToggle)`):
  - Renders series as clickable buttons with `role="button"`
  - Shows eye icon (visible) or crossed-eye icon (hidden)
  - Applies `.active` or `.inactive` classes based on visibility
  - Inline opacity styles: 100% (visible), 30-50% (hidden)
  - Attaches click and keyboard (Enter/Space) event listeners
  - Calls `onToggle(seriesId)` callback when clicked
- **Accessibility features**:
  - All form inputs have unique IDs and associated labels
  - ARIA state management (aria-expanded, aria-hidden)
  - Focus management (moves focus to first button when panel opens)
  - Returns focus to toggle button when panel closes
  - Dialog pattern implementation
  - Escape key closes panel

**chart.js (MortalityChart)**
- D3.js visualization component
- SVG architecture: layered groups (grid → lines → points → axes)
- X-scale: linear 1-52 (weeks)
- Y-scale: auto-ranging based on data (with 10% padding)
- Line generator: `d3.line()` with `curveMonotoneX` for smoothing
- **Constants** (extracted magic numbers):
  - `CHART_MARGINS`: { top: 40, right: 40, bottom: 60, left: 80 }
  - `POINT_RADIUS_DEFAULT`: 3.5
  - `POINT_RADIUS_HOVER`: 6
  - `LINE_WIDTH_DEFAULT`: 2.5
  - `LINE_WIDTH_HIGHLIGHTED`: 3.5
  - `TRANSITION_FAST`: 150ms
  - `TRANSITION_TOOLTIP`: 200ms
  - `TRANSITION_NORMAL`: 300ms
  - `TRANSITION_SLOW`: 500ms
- Tooltip: positioned absolutely, shows week/month/value on point hover
- **Accessible tooltip**: `aria-live="polite"` for screen reader announcements
- Interactions: highlight series on hover, enlarge points on hover
- Export: `downloadPNG()` and `downloadSVG()` via canvas serialization
- **Accessible chart**: `role="img"` with descriptive `aria-label` and hidden description

### Key Data Structures

**Filter State Object**
```javascript
{
    species: ['Salmón Atlántico'],                    // Array of selected species names
    regions: ['X Región', 'XI Región', 'XII Región'], // Array of selected region names (all 3 default)
    years: [2024, 2025],                              // Array of selected years
    metricType: 'total',                              // 'total' | 'primary' | 'secondary'
    selectedCauses: [],                               // Array of field names (e.g., 'mort_sec_srs')
    scaleType: 'absolute'                             // 'absolute' | 'percentage'
}
```

**Series Object Structure**
```javascript
{
    id: 'Salmón Atlántico_X Región_2024',    // Unique identifier
    label: 'Salmón Atlántico - X Región - 2024',
    species: 'Salmón Atlántico',
    region: 'X Región',
    year: 2024,
    color: '#081935',                         // Assigned from Sernapesca palette
    lineStyle: 'solid',                       // 'solid' (2024) or 'dashed' (2025)
    values: [
        {
            week: 1,
            value: 12345,
            month: 'Enero',
            timepoint: 'Semana 1 - Enero 2024',
            rawData: { /* original row */ }
        },
        // ... 52 weeks
    ]
}
```

## Data Files

**Primary Data Source**: `data/datos_summary.csv`
- 641 rows (aggregated by region × species × week)
- Contains all mortality fields: `mort_total_real`, `mort_prim_*`, `mort_sec_*`
- Timepoint format: `"Semana {1-52} - {Month} {2024|2025}"`
- This is the ONLY data file loaded (percentage data loading removed for performance)

**Note on Percentage Data**:
- Percentage calculations are done on-the-fly using `DataTransformer.convertToPercentages()`
- Calculates percentage based on total mortality: `(cause_value / mort_total_real) * 100`
- `datos_percentage.csv` exists but is not used in current implementation

## UI Content and Localization

### Page Content (Spanish)

All user-facing content is in Spanish:

**Page Title**: "Dashboard de Análisis de Mortalidad Acuícola"
**Main Heading**: "Dashboard de Análisis de Mortalidad Acuícola"
**Section Title**: "Análisis de Tendencias de Mortalidad"
**Description**: "Herramienta interactiva para visualizar y filtrar tendencias de mortalidad por especie, región y causas específicas."

**Important Terminology**:
- Use "Causas Secundarias" (Secondary Causes), NOT "Enfermedades Secundarias"
- All filter labels, button text, and UI messages are in Spanish
- LinkedIn CTA: "Contactar al Desarrollador"
- Coming Soon: "Próximamente"

### Contact Information

**Developer LinkedIn**: https://www.linkedin.com/in/agustn-pina
- Linked in share modal "Contactar en LinkedIn" button
- Opens in new tab with `rel="noopener noreferrer"`

## Styling Guidelines

### Official Sernapesca Color Palette

The application uses the official Sernapesca color palette with enhanced contrast:

```css
/* CSS Variables (css/styles.css lines 26-31) */
--chart-color-1: #081935;  /* Dark Navy Blue - Enhanced base dark tone */
--chart-color-2: #1939B7;  /* Navy Blue - More vibrant primary blue */
--chart-color-3: #7076E8;  /* Periwinkle Blue */
--chart-color-4: #009BE1;  /* Sky Blue */
--chart-color-5: #74D0C7;  /* Aquamarine */
--chart-color-6: #B8E4F2;  /* Pale Baby Blue */
```

```javascript
// JavaScript Array (js/dataTransformer.js lines 36-42)
this.officialColors = [
    '#081935', // Dark Navy Blue
    '#1939B7', // Navy Blue
    '#7076E8', // Periwinkle Blue
    '#009BE1', // Sky Blue
    '#74D0C7', // Aquamarine
    '#B8E4F2'  // Pale Baby Blue
];
```

### Button and Control Consistency

All interactive elements follow a consistent design pattern to match icon button aesthetic:

**Icon Buttons** (`.icon-btn`):
- Background: none
- Border: 1px solid var(--color-border)
- Padding: var(--spacing-sm)
- Border-radius: 4px
- Hover: background-color var(--color-bg-secondary), border-color var(--color-accent), color var(--color-accent)
- Focus: 3px solid blue outline with 2px offset

**Primary Button** (`.filter-toggle-btn`):
- Background: var(--color-accent) (#0066cc)
- Color: white
- Hover: background-color var(--color-accent-hover), transform translateY(-1px)
- Includes SVG icon + text

**Select Dropdowns** (`.custom-select`):
- Styled to match icon button aesthetic
- Custom arrow icon (data URL SVG)
- Hover: background-color var(--color-bg-secondary), border-color var(--color-accent)
- Focus: 3px solid blue outline, box-shadow rgba(0, 102, 204, 0.1)

**Modal Buttons**:
- `.btn-primary`: Blue accent button for primary actions (Copy link)
  - Background: var(--color-accent) (#0066cc)
  - Hover: darker shade with translateY(-1px) lift
- `.btn-linkedin`: LinkedIn-branded button (#0077b5)
  - Includes external link icon
  - Opens LinkedIn profile in new tab

**Coming Soon Notification** (`.coming-soon-notification`):
- Position: absolute, positioned above parent button
- Background: var(--color-warning) (#ffc107)
- Border-radius: 16px (pill-shaped)
- Animation: fadeInOut 2s (appears, holds, fades out)
- ARIA: `role="status"` with `aria-live="polite"`

**Focus Indicators**:
- All interactive elements: 3px solid blue outline (#0066cc) with 2px offset
- Uses modern `:focus-visible` approach (visible only for keyboard navigation)
- Checkbox/radio labels: outline on `:focus-within`

### Line Styles and Chart Aesthetics

**Line Rendering**:
- **2024 Data**: Solid lines, 2.5px width, normal style
- **2025 Data**: Dashed lines (5px dash, 5px gap), 2.5px width
- **Highlighted**: Increased to 3.5px width
- **Line smoothing**: `curveMonotoneX` for natural curves

**Point Rendering**:
- **Default radius**: 3.5px
- **Hover radius**: 6px
- **Fill**: white
- **Stroke**: Series color
- **Stroke-width**: 2px

**Transitions**:
- Fast (150ms): Point hover, focus changes
- Tooltip (200ms): Tooltip fade in/out
- Normal (300ms): Line/point exit animations
- Slow (500ms): Line/point enter animations, data updates

## Accessibility Implementation (WCAG 2.1 AA)

### Semantic HTML

The application uses proper semantic elements throughout:

**Form Controls**:
- `<fieldset>` and `<legend>` for checkbox groups
- `<label>` elements for select dropdowns (`.filter-title` as label)
- All inputs have unique `id` attributes with associated `for` attributes on labels
- Example ID format: `species-0-salmón-atlántico`, `region-1-xi-región`

**Landmarks**:
- `<main id="main-content">`: Main content area (target for skip link)
- `<header>`: Page header
- `<nav>`: Navigation (logo only, minimal)
- `<footer aria-label="...">`: Footer with actions
- `<aside role="dialog" aria-modal="true">`: Filter panel

**Headings**:
- Proper hierarchy: h1 → h2 → legend
- h1: Page title (Sernapesca Mortality Dashboard)
- h2: Chart title, Filter panel title
- `<legend>`: Filter section titles (Species, Region, etc.)

### ARIA Attributes

**Filter Panel (Dialog Pattern)**:
- `role="dialog"`: Identifies as modal dialog
- `aria-modal="true"`: Indicates modal behavior
- `aria-labelledby="filter-panel-title"`: Labels dialog
- `aria-hidden="true/false"`: Dynamically updated when opening/closing
- Toggle button has `aria-expanded="false/true"` and `aria-controls="filter-panel"`

**Share Modal (Dialog Pattern)**:
- `role="dialog"`: Identifies as modal dialog
- `aria-modal="true"`: Indicates modal behavior
- `aria-labelledby="share-modal-title"`: Labels modal with "Compartir Dashboard"
- Focus trap: Focus contained within modal when open
- Escape key support: Closes modal
- Returns focus to trigger button on close

**Live Regions**:
- Results count: `role="status" aria-live="polite" aria-atomic="true"`
- Selection count: `role="status" aria-live="polite" aria-atomic="true"`
- Warning message: `role="alert" aria-live="assertive" aria-atomic="true"`
- Tooltip: `aria-live="polite"` (already in chart.js)

**SVG Icons**:
- All decorative SVGs: `aria-hidden="true"`
- Prevents screen readers from announcing SVG paths

**Form Groups**:
- Checkbox containers: `role="group" aria-label="..."`
- Example: `<div class="checkbox-group" id="species-filters" role="group" aria-label="Seleccionar especies">`

**Chart Accessibility**:
- Chart container: `role="img" aria-label="..." aria-describedby="chart-description"`
- Hidden description: `<div id="chart-description" class="visually-hidden">...</div>`
- Provides context for screen reader users

### Keyboard Navigation

**Implemented Features**:
- **Skip Link**: First tab stop, links to `#main-content`, hidden until focused
- **Tab Order**: Logical flow through interactive elements
- **Enter/Space**: Activates buttons, toggles checkboxes
- **Escape**: Closes filter panel when open
- **Focus Management**:
  - Panel opens → focus moves to first button (reset)
  - Panel closes → focus returns to toggle button
- **Focus Indicators**: Visible 3px blue outline for keyboard users

**JavaScript Focus Management**:
```javascript
// When opening panel (main.js lines 115-127)
setTimeout(() => firstButton.focus(), 100);

// When closing panel (main.js lines 138)
filterToggleBtn.focus();
```

### Screen Reader Support

**Announcements**:
- Dynamic content updates announced via `aria-live` regions
- Form labels properly associated and announced
- Dialog state changes announced
- Warning messages announced assertively

**Navigation**:
- Semantic landmarks for navigation ("Skip to main content", "Main", "Navigation", "Footer")
- Heading structure for document outline
- Fieldset/legend for form sections

## Data Validation Rules

### Scale Type Restrictions

The application enforces mutual exclusivity between "Total Mortality" and "Percentage Scale":

**Validation Logic** (`filters.js`):

1. **When metric changes to "Total"** (lines 230-236):
```javascript
if (value === 'total' && this.state.scaleType === 'percentage') {
    this.state.scaleType = 'absolute';
    document.getElementById('scale-select').value = 'absolute';
    if (CONFIG.DEBUG) console.log('Auto-switched to absolute scale...');
}
```

2. **When scale changes to "Percentage"** (lines 248-254):
```javascript
if (value === 'percentage' && this.state.metricType === 'total') {
    this.state.metricType = 'primary';
    document.getElementById('metric-select').value = 'primary';
    if (CONFIG.DEBUG) console.log('Auto-switched to primary causes...');
    this.updateMetricSections();
}
```

3. **Visual Feedback** (lines 266-279):
```javascript
updateScaleAvailability() {
    const percentageOption = scaleSelect.querySelector('option[value="percentage"]');
    if (this.state.metricType === 'total') {
        percentageOption.disabled = true;
        percentageOption.textContent = 'Porcentaje (%) - No disponible con Mortalidad Total';
    } else {
        percentageOption.disabled = false;
        percentageOption.textContent = 'Porcentaje (%)';
    }
}
```

**Rationale**:
Total mortality as a percentage of itself is always 100%, providing no meaningful visualization. The system prevents this invalid state and provides user feedback.

### Line Limit Enforcement

**Maximum**: 6 lines displayed simultaneously

**Implementation** (`dataTransformer.js` lines 324-350):
```javascript
limitSeries(series, maxLines = 6) {
    if (series.length <= maxLines) {
        return { series, exceeded: false };
    }

    // Sort by total mortality (descending)
    const sorted = series.map(s => ({
        ...s,
        totalMortality: s.values.reduce((sum, v) => sum + v.value, 0)
    })).sort((a, b) => b.totalMortality - a.totalMortality);

    // Return top N series
    return {
        series: sorted.slice(0, maxLines),
        exceeded: true
    };
}
```

**UI Feedback**:
- Warning message displayed when `exceeded === true`
- Warning has `role="alert"` for screen reader announcement
- Located at bottom of filter panel

## Common Development Tasks

### Modifying CSV Data Paths

Data path is in `js/dataLoader.js`, line 17:
```javascript
const summaryData = await d3.csv('../data/datos_summary.csv');
```

If deploying to subdirectory, paths may need adjustment.

### Adding a New Filter

1. Add filter state property in `js/filters.js` constructor (lines 12-19)
2. Create HTML section in `index.html` filter panel using `<fieldset>` for checkboxes or `<label>` for selects
3. Add population method in `FilterManager` (e.g., `populateNewFilter()`)
4. Generate proper IDs for form controls: `${type}-${index}-${value.toLowerCase().replace(/\s+/g, '-')}`
5. Add event listener in `initializeEventListeners()`
6. Add handler method (e.g., `handleNewFilterChange()`)
7. Update `DataTransformer.filterData()` to apply new filter
8. Update URL encoding in `main.js` `updateURL()` method

### Changing Default Filters

Edit `js/filters.js` at lines 12-19:
```javascript
this.state = {
    species: ['Salmón Atlántico'],                    // Default species
    regions: ['X Región', 'XI Región', 'XII Región'], // Default: all 3 regions
    years: [2024, 2025],                              // Default: both years
    metricType: 'total',                              // Default: total mortality
    selectedCauses: [],                               // Empty by default
    scaleType: 'absolute'                             // Default: absolute count
};
```

**Important**: The default regions must match the `resetToDefaults()` method (lines 380-398).

### Modifying Chart Appearance

**Colors** (Two locations must be kept in sync):
1. CSS variables: `css/styles.css` lines 26-31
2. JavaScript array: `js/dataTransformer.js` lines 36-42

**Chart Margins**:
`js/chart.js` line 20:
```javascript
this.CHART_MARGINS = { top: 40, right: 40, bottom: 60, left: 80 };
```

**Chart Height**:
`css/styles.css` (search for `.chart-area`):
```css
.chart-area {
    min-height: 500px;
}
```

**Line Width**:
`js/chart.js` lines 23-24:
```javascript
this.LINE_WIDTH_DEFAULT = 2.5;
this.LINE_WIDTH_HIGHLIGHTED = 3.5;
```

**Point Size**:
`js/chart.js` lines 21-22:
```javascript
this.POINT_RADIUS_DEFAULT = 3.5;
this.POINT_RADIUS_HOVER = 6;
```

**Transition Speeds**:
`js/chart.js` lines 25-28:
```javascript
this.TRANSITION_FAST = 150;
this.TRANSITION_TOOLTIP = 200;
this.TRANSITION_NORMAL = 300;
this.TRANSITION_SLOW = 500;
```

### Adding New Mortality Causes

If new causes are added to CSV data:

1. Update `DataLoader.getPrimaryCauses()` (lines 162-174) or `getSecondaryDiseases()` (lines 180-202)
2. Update `DataTransformer.getCauseLabel()` mapping (lines 244-276)
3. Filter UI will auto-populate from these methods with proper IDs and labels

### Debugging Tips

**DEBUG Mode**:
Set `DEBUG: true` in `js/config.js` to enable console logging throughout the application.

**Console Logging Locations**:
- `main.js`: Data loading, filter changes, series generation
- `filters.js`: Metric/scale auto-switching
- `dataTransformer.js`: Series creation, color assignments
- `chart.js`: SVG export issues

**Common Issues**:
- **Data not loading**: Check CSV file path in `dataLoader.js` line 17
- **Filters not working**: Verify event listeners in browser DevTools
- **Chart not rendering**: Check that `#chart` container exists and has dimensions
- **Blank chart**: Ensure at least one species, region, and year are selected
- **Accessibility errors**: Run axe DevTools or WAVE browser extensions

**Data Flow Inspection Points**:
1. `MortalityDashboard.handleFilterChange()` - logs filter state
2. `DataTransformer.transformToSeries()` - logs series before/after limiting
3. `MortalityChart.render()` - receives final series array

## Code Quality Standards

### Recent Improvements (Version 2.0.0)

**Naming Conventions**:
- Changed `serie` to `seriesItem` for clarity (Spanish/English mix → English)
- Consistent use of single quotes throughout JavaScript
- No magic strings or numbers (extracted to constants)

**Dead Code Removal**:
- Removed unused CSS variables: `--chart-color-7`, `--chart-color-8`
- Removed dead CSS classes: `.current-selection`, `.filter-sections`, `.results-count`
- Removed unused function: `loadStateFromURL()` (functionality not implemented)
- Removed empty method: `hideLoading()`
- Removed dead event listener: `settings-toggle` button handler
- Removed unused percentage data loading (HTTP request eliminated)

**Performance Optimizations**:
- All console.log wrapped in `if (CONFIG.DEBUG)` conditional
- Single CSV source (eliminated second HTTP request)
- Magic numbers extracted to named constants

**Consistency Improvements**:
- Default regions aligned between initial state and reset function
- Redundant text-anchor attribute removed
- Consistent transition durations throughout

### Maintaining Code Quality

When modifying code:

1. **Use DEBUG mode**: Wrap all console.log in `if (CONFIG.DEBUG)`
2. **Extract magic numbers**: Define as constants at top of class
3. **Maintain accessibility**:
   - Add ARIA attributes to new interactive elements
   - Ensure proper label associations
   - Test keyboard navigation
4. **Follow naming conventions**: Use English, camelCase, descriptive names
5. **Remove dead code**: Don't comment out, delete unused code
6. **Update both CSS and JS**: Keep color palettes in sync
7. **Test validation**: Ensure metric/scale restrictions still work

## Customization Examples

### Change Year Line Styles

In `js/dataTransformer.js`, modify line style logic (lines 135, 198):
```javascript
lineStyle: values[0].year === 2024 ? 'solid' : 'dashed',
```

Could be changed to color-based differentiation or other patterns.

### Add Statistical Overlays

Create new method in `chart.js`:
```javascript
renderTrendLine(series) {
    // Use d3.line() with regression calculation
}
```

Call from `render()` method after rendering data lines.

### Export Data as CSV

Add method to `MortalityDashboard`:
```javascript
exportFilteredData() {
    const csv = d3.csvFormat(this.currentFilteredData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `mortality-data-${Date.now()}.csv`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
}
```

## URL State Sharing

Filter state is encoded in URL query parameters for sharing:
```
?species=Salmón%20Atlántico&regions=X%20Región,XI%20Región&years=2024,2025&metric=total&scale=absolute
```

**Encoding** happens in `main.js` `updateURL()` method (lines 201-229).

**Decoding** functionality was removed (dead code cleanup). To re-implement:
1. Restore `loadStateFromURL()` method
2. Call from `init()` method before rendering initial state
3. Update `FilterManager.setState()` to handle URL state

## Performance Considerations

- **Data loading**: 641 rows loads in ~200-500ms
- **Chart rendering**: ~300-500ms with D3 transitions
- **Filter changes**: Full re-render (could be optimized with data joining)
- **6-line limit**: Prevents performance degradation with many series
- **DEBUG mode**: Disabled in production for performance
- **Single HTTP request**: Only loads `datos_summary.csv` (percentage data removed)

## Browser Compatibility

Requires ES6+ module support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Uses D3.js v7 from CDN (`index.html` line 8).

## Testing Accessibility

### Automated Tools

1. **axe DevTools**: Browser extension for WCAG compliance
2. **WAVE**: Web accessibility evaluation tool
3. **Lighthouse**: Built into Chrome DevTools (Accessibility score)

### Manual Testing

1. **Keyboard Navigation**:
   - Tab through all elements
   - Enter/Space to activate
   - Escape to close panel
   - Verify skip link appears

2. **Screen Readers**:
   - NVDA (Windows - free)
   - JAWS (Windows - paid)
   - VoiceOver (macOS - built-in)
   - Verify form labels announced
   - Confirm live regions announce updates

3. **Focus Indicators**:
   - Navigate with keyboard
   - Verify all elements show clear focus outline
   - Check focus-within on labels

4. **Color Contrast**:
   - Use WebAIM Contrast Checker
   - Verify all text meets WCAG AA standards (4.5:1 ratio)

### Known Accessibility Features

- ✅ All WCAG 2.1 Level AA criteria met
- ✅ Keyboard navigation fully functional
- ✅ Screen reader tested with VoiceOver
- ✅ Semantic HTML throughout
- ✅ ARIA attributes properly implemented
- ✅ Focus management for modal dialog
- ✅ Live regions for dynamic content
- ✅ Form labels and associations complete

## Additional Resources

- **README.md**: User-facing documentation
- **Browser DevTools**: For debugging and performance analysis
- **D3.js Documentation**: https://d3js.org/
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Practices**: https://www.w3.org/WAI/ARIA/apg/

---

Last updated: 2025-10-29 (Version 2.0.0)
