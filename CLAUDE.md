# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A D3.js-based interactive web application for visualizing Chilean salmon mortality data from Sernapesca (2024-2025). The application provides dynamic filtering, year-over-year comparisons, and multi-series line charts inspired by Epoch AI's benchmarking dashboard.

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

**Important**: The application must be served via HTTP server (not `file://` protocol) due to CORS restrictions when loading CSV files.

## Architecture Overview

### Data Flow Pipeline

```
CSV Files → DataLoader → DataTransformer → FilterManager ↔ MortalityChart
                              ↓
                         Filter State
                              ↓
                        Series Generation
                              ↓
                         D3.js Rendering
```

### Module Responsibilities

**main.js (MortalityDashboard)**
- Application orchestrator
- Coordinates all modules via dependency injection
- Handles filter state changes through callback pattern
- Manages URL state for sharing (`updateURL()`)
- Entry point: instantiated on `DOMContentLoaded`

**dataLoader.js (DataLoader)**
- Loads CSV files from `data/` folder using `d3.csv()`
- Parses timepoint strings to extract week number and year via regex: `/Semana (\d+) - \w+ (\d{4})/`
- Converts all mortality fields from CSV strings to numbers
- Adds computed fields: `seriesId`, `displayLabel`, `week`, `year`
- Provides metadata methods: `getSpecies()`, `getRegions()`, `getPrimaryCauses()`, etc.

**dataTransformer.js (DataTransformer)**
- Filters raw data based on hierarchical filter state
- Transforms filtered data into chart-ready series objects
- Handles two transformation modes:
  - Total mortality: groups by `species × region × year`
  - Cause-specific: creates series for each `cause × species × region × year`
- Converts absolute values to percentages when `scaleType === 'percentage'`
- Enforces 6-line maximum via `limitSeries()` (sorts by total mortality, returns top 6)
- Assigns colors from D3 ordinal scale
- Assigns line styles: solid for 2024, dashed for 2025

**filters.js (FilterManager)**
- Manages filter panel UI state
- Hierarchical filter structure: Species → Region → Year → Cause
- Default state: Atlantic Salmon, all regions, both years, total mortality
- Dynamically shows/hides cause sections based on metric type
- Uses event delegation for checkbox/radio change events
- Invokes callback (`onFilterChange`) on any state change
- Updates selection list with color swatches matching chart series

**chart.js (MortalityChart)**
- D3.js visualization component
- SVG architecture: layered groups (grid → lines → points → axes)
- X-scale: linear 1-52 (weeks)
- Y-scale: auto-ranging based on data (with 10% padding)
- Line generator: `d3.line()` with `curveMonotoneX` for smoothing
- Tooltip: positioned absolutely, shows week/month/value on point hover
- Interactions: highlight series on hover, enlarge points on hover
- Export: `downloadPNG()` and `downloadSVG()` via canvas serialization

### Key Data Structures

**Filter State Object**
```javascript
{
    species: ['Salmón Atlántico'],           // Array of selected species names
    regions: ['X Región', 'XI Región'],       // Array of selected region names
    years: [2024, 2025],                      // Array of selected years
    metricType: 'total',                      // 'total' | 'primary' | 'secondary'
    selectedCauses: [],                       // Array of field names (e.g., 'mort_sec_srs')
    scaleType: 'absolute'                     // 'absolute' | 'percentage'
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
    color: '#1f77b4',                         // Assigned by DataTransformer
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

**Secondary Data Source**: `data/datos_percentage.csv`
- Same structure as summary
- Used when `scaleType === 'percentage'` (currently not implemented in the data flow)
- Contains pre-calculated percentage fields: `pct_prim_*`, `pct_sec_*`

See `DATA_DICTIONARY.md` for complete field descriptions.

## Common Development Tasks

### Modifying CSV Data Paths

Data paths are in `js/dataLoader.js`, line 18-20:
```javascript
d3.csv('../data/datos_summary.csv'),     // Relative to index.html location
d3.csv('../data/datos_percentage.csv')
```

If deploying to subdirectory, paths may need adjustment.

### Adding a New Filter

1. Add filter state property in `js/filters.js` constructor
2. Create HTML section in `index.html` filter panel
3. Add population method in `FilterManager` (e.g., `populateNewFilter()`)
4. Add event listener in `initializeEventListeners()`
5. Add handler method (e.g., `handleNewFilterChange()`)
6. Update `DataTransformer.filterData()` to apply new filter

### Changing Default Filters

Edit `js/filters.js` at line ~13:
```javascript
this.state = {
    species: ['Salmón Atlántico'],  // Change default species here
    regions: ['X Región'],           // Change default regions here
    // ...
};
```

### Modifying Chart Appearance

**Colors**: `css/styles.css` lines 18-25 (CSS variables)
```css
--chart-color-1: #1f77b4;  /* Blue */
```

**Chart Height**: `css/styles.css` line ~194
```css
.chart-area { height: 600px; }
```

**Line Width**: `js/chart.js` line generation (search for `stroke-width`)

**Point Size**: `js/chart.js` in `renderPoints()` method

### Adding New Mortality Causes

If new causes are added to CSV data:

1. Update `DataLoader.getPrimaryCauses()` or `getSecondaryDiseases()`
2. Update `DataTransformer.getCauseLabel()` mapping
3. Filter UI will auto-populate from these methods

### Debugging Tips

**Check browser console** - all modules use `console.log()` for state changes

**Common issues**:
- "Data not loading": Check CSV file paths in `dataLoader.js`
- "Filters not working": Verify event listeners in browser DevTools
- "Chart not rendering": Check that `#chart` container exists and has dimensions
- "Blank chart": Ensure at least one species, region, and year are selected

**Data flow inspection points**:
1. `MortalityDashboard.handleFilterChange()` - logs filter state
2. `DataTransformer.transformToSeries()` - logs series before/after limiting
3. `MortalityChart.render()` - receives final series array

## Customization Examples

### Change Year Line Styles

In `js/dataTransformer.js`, modify line style logic:
```javascript
lineStyle: values[0].year === 2024 ? 'solid' : 'dashed',
```

Could be changed to color-based differentiation instead.

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
    // Create download link
}
```

## URL State Sharing

Filter state is encoded in URL query parameters for sharing:
- `?species=Salmón%20Atlántico&regions=X%20Región&years=2024,2025`

Encoding happens in `main.js` `updateURL()` method.
Decoding would happen in `loadStateFromURL()` (currently not called - add to `init()` if needed).

## Performance Considerations

- Data loading: 641 rows loads in ~200-500ms
- Chart rendering: ~300-500ms with D3 transitions
- Filter changes trigger full re-render (could be optimized with data joining)
- 6-line limit prevents performance degradation with too many series

## Browser Compatibility

Requires ES6+ module support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Uses D3.js v7 from CDN (index.html line 8).
