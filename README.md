# Chilean Salmon Mortality Data Visualization

An interactive D3.js-based web application for visualizing and analyzing salmon mortality trends across Chilean regions, species, and time periods.

## Overview

This project provides a comprehensive visualization tool for exploring Chilean salmon aquaculture mortality data from 2024-2025. The interface is inspired by Epoch AI's benchmarking dashboard, featuring dynamic filtering, year-over-year comparisons, and interactive charts.

## Features

### Core Functionality
- **Interactive Multi-Line Chart**: D3.js powered visualization with smooth transitions and animations
- **Year-Over-Year Comparison**: Overlay 2024 and 2025 data with different line styles (solid vs dashed)
- **Dynamic Filtering**: Hierarchical filter system (Species → Region → Year → Cause)
- **Dual Y-Axis Modes**: Switch between absolute counts and percentages
- **6-Line Maximum**: Automatic limiting with visual warnings
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Data Metrics
- **Total Mortality**: Overall mortality counts across all causes
- **Primary Causes**: 10 primary mortality categories (predators, environmental, disease, etc.)
- **Secondary Diseases**: 20 specific disease types (SRS, ISA, BKD, etc.)

### Interactivity
- **Hover Tooltips**: Detailed information on data points
- **Line Highlighting**: Click/hover to emphasize specific series
- **Data Point Enlargement**: Enhanced visibility on hover
- **URL Sharing**: Share filtered views via URL parameters
- **Download Options**: Export charts as PNG or SVG

## Project Structure

```
mortalidades_sernapesca_2025/
├── index.html                 # Main HTML structure
├── css/
│   └── styles.css            # Complete styling (Epoch AI aesthetic)
├── js/
│   ├── main.js               # Application orchestration
│   ├── dataLoader.js         # CSV loading and parsing
│   ├── dataTransformer.js    # Data filtering and transformation
│   ├── filters.js            # Filter panel UI management
│   └── chart.js              # D3.js chart rendering
├── data/
│   ├── datos_summary.csv     # Aggregated mortality data (primary)
│   └── datos_percentage.csv  # Percentage contribution data
├── DATA_DICTIONARY.md         # Complete data documentation
└── README.md                  # This file
```

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (Python, Node.js, or any HTTP server)

### Installation

1. **Clone or download this repository**
   ```bash
   cd /path/to/mortalidades_sernapesca_2025
   ```

2. **Start a local web server**

   **Option 1: Python 3**
   ```bash
   python3 -m http.server 8080
   ```

   **Option 2: Python 2**
   ```bash
   python -m SimpleHTTPServer 8080
   ```

   **Option 3: Node.js (http-server)**
   ```bash
   npx http-server -p 8080
   ```

   **Option 4: PHP**
   ```bash
   php -S localhost:8080
   ```

3. **Open in browser**
   ```
   http://localhost:8080
   ```

### Usage

#### Default View
When you first load the application, you'll see:
- **Species**: Salmón Atlántico (Atlantic Salmon)
- **Regions**: All regions (X, XI, XII)
- **Years**: 2024 and 2025
- **Metric**: Total Mortality
- **Scale**: Absolute Count
- **Result**: 6 lines showing mortality trends across regions and years

#### Filtering Data

1. **Select Species** (Step 1)
   - Check/uncheck species: Salmón Atlántico, Trucha arcoíris, Salmón coho

2. **Select Regions** (Step 2)
   - Filter by Chilean regions: X Región, XI Región, XII Región

3. **Select Years** (Step 3)
   - Compare 2024 vs 2025
   - 2024 = solid lines, 2025 = dashed lines

4. **Choose Metric Type**
   - **Total Mortality**: Overall deaths
   - **Primary Causes**: Select from 10 primary categories
   - **Secondary Diseases**: Select from 20 specific diseases

5. **Choose Y-Axis Scale**
   - **Absolute Count**: Raw mortality numbers
   - **Percentage (%)**: Relative contribution

#### Interacting with the Chart

- **Hover over lines**: Highlight and dim others
- **Hover over points**: Show detailed tooltip
- **Click Download**: Export as PNG or SVG
- **Click Share**: Copy shareable URL to clipboard

## Data Source

The visualization uses three CSV datasets generated from Sernapesca mortality records:

### 1. datos_summary.csv (Primary)
- **Rows**: 641 observations
- **Contains**: Aggregated mortality counts by region, species, and week
- **Use**: Main data source for visualization

### 2. datos_percentage.csv
- **Rows**: Same as summary
- **Contains**: Percentage contributions of each cause
- **Use**: Percentage view mode

### 3. datos_procesados_raw.csv (Not used in visualization)
- **Rows**: 393,642 individual records
- **Contains**: Raw granular data
- **Use**: Available for custom analysis

See [DATA_DICTIONARY.md](DATA_DICTIONARY.md) for complete field descriptions.

## Technical Details

### Technologies Used
- **D3.js v7**: Data visualization and chart rendering
- **Vanilla JavaScript (ES6+)**: Application logic
- **CSS3**: Styling and responsive design
- **No build process**: Direct browser execution

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance
- **Load Time**: ~200-500ms (641 rows)
- **Render Time**: ~300-500ms per filter change
- **Smooth Transitions**: 60 FPS animations

## Customization

### Color Palette
Edit colors in [css/styles.css](css/styles.css):
```css
:root {
    --chart-color-1: #1f77b4; /* Blue */
    --chart-color-2: #ff7f0e; /* Orange */
    /* Add more colors as needed */
}
```

### Default Filters
Edit initial state in [js/filters.js](js/filters.js):
```javascript
this.state = {
    species: ['Salmón Atlántico'],
    regions: ['X Región', 'XI Región', 'XII Región'],
    years: [2024, 2025],
    metricType: 'total',
    scaleType: 'absolute'
};
```

### Chart Dimensions
Edit in [css/styles.css](css/styles.css):
```css
.chart-area {
    height: 600px; /* Adjust height */
}
```

## Troubleshooting

### Issue: Chart doesn't load
- **Solution**: Check browser console for errors. Ensure you're running a local server (not opening `file://` directly)

### Issue: Data not showing
- **Solution**: Verify CSV files are in the `data/` folder and paths are correct in `dataLoader.js`

### Issue: CORS errors
- **Solution**: Use a proper HTTP server (Python, Node.js) instead of opening HTML directly

### Issue: Filters not working
- **Solution**: Check browser console. Ensure all JavaScript files are loading correctly

## Future Enhancements

Potential improvements:
- [ ] Add date range slider for custom time periods
- [ ] Export data as CSV from filtered view
- [ ] Add statistical summary panel (mean, median, trends)
- [ ] Implement drill-down to raw data
- [ ] Add predictive trend lines
- [ ] Multi-chart comparison view
- [ ] Dark mode toggle

## Credits

- **Data Source**: Sernapesca (Chilean National Fisheries and Aquaculture Service)
- **Design Inspiration**: Epoch AI Benchmarking Dashboard
- **Visualization Library**: D3.js
- **Developer**: [Your Name/Organization]

## License

CC-BY | Sernapesca 2024-2025

---

## Contact

For questions, issues, or contributions:
- Email: [your-email]
- GitHub: [your-github]

## Changelog

### Version 1.0.0 (2025-10-27)
- Initial release
- Basic filtering and visualization
- Year-over-year comparison
- Download and share functionality
