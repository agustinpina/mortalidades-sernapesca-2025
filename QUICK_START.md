# Quick Start Guide

## 🚀 Get Up and Running in 2 Minutes

### Step 1: Start the Server
Open your terminal in this directory and run:

```bash
python3 -m http.server 8080
```

### Step 2: Open in Browser
Navigate to:
```
http://localhost:8080
```

That's it! The dashboard should now be running.

---

## 📊 First Look

When the page loads, you'll see:
- **Chart**: 6 lines showing Atlantic Salmon mortality across 3 regions (2024 vs 2025)
- **Filter Panel**: On the right side with all filter options
- **Navigation**: At the top

---

## 🎯 Quick Tutorial

### 1. Change Species
- In the filter panel, uncheck "Salmón Atlántico"
- Check "Trucha arcoíris" instead
- Chart updates instantly!

### 2. Compare Years
- Both 2024 and 2025 are selected by default
- Solid lines = 2024
- Dashed lines = 2025

### 3. View Specific Causes
- Change "Metric Type" from "Total Mortality" to "Primary Causes"
- Check any cause (e.g., "Disease (Secundaria)")
- See that specific cause's trend

### 4. Switch to Percentages
- Change "Y-Axis Scale" to "Percentage (%)"
- Now you see relative importance instead of absolute counts

### 5. Hover for Details
- Move your mouse over any data point
- See exact values in tooltip

---

## ⚡ Pro Tips

1. **6-Line Limit**: You can only display 6 lines at once. If you exceed this, you'll see a warning.

2. **Share Your View**:
   - Click the share button (📤) at the bottom
   - Your current filter settings are saved in the URL
   - Copy and share with colleagues

3. **Download Charts**:
   - Click the download button (📥)
   - Choose PNG (for presentations) or SVG (for editing)

4. **Mobile Friendly**:
   - On mobile, click "Graph Settings" button to open filter panel
   - Click × to close it

---

## 🔧 Common Use Cases

### "Show me SRS disease trends for Atlantic Salmon in Region X"

1. Species: Check only "Salmón Atlántico"
2. Region: Check only "X Región"
3. Year: Keep both 2024 and 2025 checked
4. Metric Type: Select "Secondary Diseases"
5. Check only "SRS (Piscirickettsia)"

Result: 2 lines comparing SRS mortality year-over-year

---

### "Compare all species in one region"

1. Species: Check all 3 species
2. Region: Check only "XI Región"
3. Year: Check only "2024"
4. Metric Type: Keep "Total Mortality"

Result: 3 lines showing species comparison

---

### "What percentage of deaths are from environmental causes?"

1. Keep default species/regions
2. Metric Type: Select "Primary Causes"
3. Check "Environmental (Ambiental)"
4. Y-Axis Scale: Select "Percentage (%)"

Result: See environmental causes as % of total mortality

---

## ❓ Troubleshooting

**Q: Chart is blank**
- A: Check that you have at least one species, region, and year selected

**Q: "Address already in use" error**
- A: Port 8080 is taken. Try: `python3 -m http.server 8081`

**Q: Filters not working**
- A: Open browser console (F12) and check for errors
- Make sure all files loaded correctly

**Q: Data looks wrong**
- A: Verify CSV files are in the `data/` folder
- Check that file paths in `dataLoader.js` are correct

---

## 📖 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [DATA_DICTIONARY.md](DATA_DICTIONARY.md) to understand the data
- Explore the code in the `js/` folder to customize

---

## 🎨 Quick Customization

### Change Chart Height
Edit `css/styles.css`, line ~150:
```css
.chart-area {
    height: 800px; /* Change from 600px */
}
```

### Change Default Species
Edit `js/filters.js`, line ~15:
```javascript
species: ['Trucha arcoíris'], // Changed from Salmón Atlántico
```

### Change Colors
Edit `css/styles.css`, lines ~20-27:
```css
--chart-color-1: #FF6B6B; /* New red color */
```

---

**Happy Visualizing! 📈**
