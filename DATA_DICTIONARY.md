# Data Dictionary - Salmon Mortality Datasets
## Overview of Generated Datasets

This document describes three related datasets generated from Chilean salmon mortality data, each serving different analytical purposes.

---

## Dataset 1: Raw Processed Data (`datos_procesados_raw.csv`)

**Purpose**: Complete individual-level mortality records with calculated totals  
**Rows**: 393,642 observations  
**Use Case**: Detailed analysis, filtering specific cases, granular exploration

### Column Definitions

#### Identification Variables
| Column | Type | Description |
|--------|------|-------------|
| `region` | Character | Chilean administrative region where mortality occurred (e.g., "X Región", "XI Región") |
| `especie` | Character | Fish species (e.g., "Trucha arcoíris" = Rainbow trout, "Salmón coho" = Coho salmon, "Salmón Atlántico" = Atlantic salmon) |
| `semana` | Character | Week number (1-52) |
| `periodo_mes` | Character | Month and year (e.g., "Enero 2024") |
| `timepoint` | Character | **NEW** - Combined time identifier (e.g., "Semana 1 - Enero 2024") |

#### Primary Mortality Causes (mort_prim_*)
Total mortality broken down by primary cause. **All values are counts of individual fish.**

| Column | Description |
|--------|-------------|
| `mort_total` | Original total mortality count |
| `mort_prim_depredadores` | Deaths caused by predators |
| `mort_prim_embrionaria` | Embryonic mortality |
| `mort_prim_eliminacion` | Culling/elimination |
| `mort_prim_ambiental` | Environmental factors |
| `mort_prim_sin_causa_aparente` | Deaths with no apparent cause |
| `mort_prim_secundaria` | **UPDATED** - Deaths from secondary diseases (replaced with `mort_sec_real`) |
| `mort_prim_otras` | Other causes |
| `mort_prim_desadaptado` | Maladapted individuals |
| `mort_prim_deforme` | Deformed individuals |
| `mort_prim_dano_mecanico` | Mechanical damage |
| `mort_total_real` | **NEW** - Sum of all primary mortality causes |

#### Secondary Mortality Causes (mort_sec_*)
Specific disease-related mortalities. **All values are counts of individual fish.**

| Column | Disease Name | Description |
|--------|-------------|-------------|
| `mort_sec_vibrio` | Vibriosis | Bacterial infection (Vibrio spp.) |
| `mort_sec_ipn` | IPN | Infectious Pancreatic Necrosis (viral) |
| `mort_sec_furunculosis_atipica` | Atypical Furunculosis | Bacterial infection (Aeromonas salmonicida) |
| `mort_sec_bkd` | BKD | Bacterial Kidney Disease (Renibacterium salmoninarum) |
| `mort_sec_srs` | SRS | Salmon Rickettsial Syndrome (Piscirickettsia salmonis) |
| `mort_sec_isa` | ISA | Infectious Salmon Anemia (viral) |
| `mort_sec_sit` | SIT | Idiopathic Rainbow Trout Syndrome |
| `mort_sec_yersiniosis` | Yersiniosis | Bacterial infection (Yersinia ruckeri) |
| `mort_sec_micosis` | Mycosis | Fungal infection |
| `mort_sec_francisellosis` | Francisellosis | Bacterial infection (Francisella spp.) |
| `mort_sec_flavobacteriosis` | Flavobacteriosis | Bacterial infection (Flavobacterium spp.) |
| `mort_sec_amebiasis` | Amebiasis | Parasitic infection (amoebae) |
| `mort_sec_sindrome_icterico` | Jaundice Syndrome | Liver-related disease |
| `mort_sec_hsmi` | HSMI | Heart and Skeletal Muscle Inflammation (viral) |
| `mort_sec_tenacibaculosis` | Tenacibaculosis | Bacterial infection (Tenacibaculum spp.) |
| `mort_sec_estreptococosis` | Streptococcosis | Bacterial infection (Streptococcus spp.) |
| `mort_sec_ich` | Ich | Syndrome of Ichthyophthirius-type |
| `mort_sec_exofialosis` | Exophiala infection | Fungal infection |
| `mort_sec_shs` | SHS | Salmon Hemorrhagic Syndrome |
| `mort_sec_nefrocalcinosis` | Nephrocalcinosis | Kidney calcification |
| `mort_sec_real` | **NEW** - Sum of all secondary disease mortalities |

#### Data Quality Notes
- All NA values have been converted to 0
- `mort_prim_secundaria` now equals `mort_sec_real` for consistency
- `mort_total_real` should approximately equal `mort_total` (original reporting)

---

## Dataset 2: Summary Data (`datos_summary.csv`)

**Purpose**: Aggregated mortality totals by region, species, and time period  
**Rows**: Variable (depends on unique combinations of region × species × timepoint)  
**Use Case**: Time series analysis, comparing regions/species, trend visualization

### Column Definitions

#### Grouping Variables
| Column | Type | Description |
|--------|------|-------------|
| `region` | Character | Geographic region |
| `especie` | Character | Fish species |
| `timepoint` | Character | Time period identifier |
| `n_observaciones` | Integer | **NEW** - Number of raw observations in this group |

#### Mortality Totals
All `mort_*` columns from Dataset 1, but with **summed values** across all observations in each group.

**Example**: If there are 50 observations for "X Región / Salmón Atlántico / Semana 1 - Enero 2024", all mortality counts are summed across those 50 records.

#### Key Differences from Raw Data
- Each row represents aggregated data for a unique region-species-timepoint combination
- Values show **total mortality burden** for that group
- `n_observaciones` indicates how many individual records contributed to each row

---

## Dataset 3: Percentage Contribution Data (`datos_percentage.csv`)

**Purpose**: Show relative importance of each mortality cause  
**Rows**: Same as `datos_summary.csv`  
**Use Case**: Pie charts, stacked bar charts, identifying dominant causes

### Column Definitions

#### Grouping Variables
Same as Dataset 2 (region, especie, timepoint, n_observaciones)

#### Absolute Mortality Counts
All `mort_*` columns from Dataset 2 (summed values)

#### Percentage Columns - Primary Causes (pct_prim_*)
Percentage contribution of each primary cause to `mort_total_real`

| Column | Formula | Interpretation |
|--------|---------|----------------|
| `pct_prim_depredadores` | (mort_prim_depredadores / mort_total_real) × 100 | % of total mortality from predators |
| `pct_prim_embrionaria` | (mort_prim_embrionaria / mort_total_real) × 100 | % of total mortality from embryonic issues |
| `pct_prim_eliminacion` | (mort_prim_eliminacion / mort_total_real) × 100 | % of total mortality from culling |
| `pct_prim_ambiental` | (mort_prim_ambiental / mort_total_real) × 100 | % of total mortality from environmental factors |
| `pct_prim_sin_causa_aparente` | (mort_prim_sin_causa_aparente / mort_total_real) × 100 | % of total mortality with no apparent cause |
| `pct_prim_secundaria` | (mort_prim_secundaria / mort_total_real) × 100 | % of total mortality from diseases |
| `pct_prim_otras` | (mort_prim_otras / mort_total_real) × 100 | % of total mortality from other causes |
| `pct_prim_desadaptado` | (mort_prim_desadaptado / mort_total_real) × 100 | % of total mortality from maladapted fish |
| `pct_prim_deforme` | (mort_prim_deforme / mort_total_real) × 100 | % of total mortality from deformities |
| `pct_prim_dano_mecanico` | (mort_prim_dano_mecanico / mort_total_real) × 100 | % of total mortality from mechanical damage |

**Note**: All primary percentages should sum to 100% (or close to 100% accounting for rounding)

#### Percentage Columns - Secondary Causes (pct_sec_*)
Percentage contribution of each disease to `mort_sec_real` (disease-only mortality)

| Column | Formula | Interpretation |
|--------|---------|----------------|
| `pct_sec_vibrio` | (mort_sec_vibrio / mort_sec_real) × 100 | % of disease mortality from vibriosis |
| `pct_sec_ipn` | (mort_sec_ipn / mort_sec_real) × 100 | % of disease mortality from IPN |
| ... | ... | (same pattern for all 20 diseases) |
| `pct_sec_nefrocalcinosis` | (mort_sec_nefrocalcinosis / mort_sec_real) × 100 | % of disease mortality from nephrocalcinosis |

**Note**: All secondary percentages should sum to 100% within disease-related deaths

#### Special Values
- **0%**: Indicates no deaths from that cause in the group OR no total deaths (division by zero)
- **NaN/Inf**: Replaced with 0 in the data (occurs when denominator is zero)

---

## Choosing the Right Dataset

### Use `datos_procesados_raw.csv` when you need to:
- Filter specific observations
- Perform custom aggregations
- Conduct detailed statistical analysis
- Investigate individual cases or outliers

### Use `datos_summary.csv` when you need to:
- Create time series visualizations
- Compare total mortality across regions or species
- Show absolute numbers in dashboards
- Analyze trends over weeks/months

### Use `datos_percentage.csv` when you need to:
- Create composition charts (pie, stacked bar, treemap)
- Compare relative importance of causes
- Answer "What's the main cause of death?" questions
- Normalize for comparison across groups with different scales

---

## Data Processing Steps Applied

1. **NA Handling**: All missing values converted to 0
2. **Time Consolidation**: Combined `semana` and `periodo_mes` into readable `timepoint`
3. **Disease Total**: Created `mort_sec_real` summing all 20 disease categories
4. **Consistency Fix**: Replaced `mort_prim_secundaria` with calculated `mort_sec_real`
5. **Total Recalculation**: Created `mort_total_real` summing all 10 primary causes
6. **Aggregation**: Grouped by region, species, and timepoint
7. **Percentage Calculation**: Computed relative contributions of each cause

---

## Example Use Cases

### Example 1: "What's killing the most salmon in Region XI?"
**Dataset**: `datos_summary.csv`  
**Filter**: `region == "XI Región"`  
**Analysis**: Sum all `mort_prim_*` columns and compare

### Example 2: "Which disease is the biggest problem for Atlantic salmon?"
**Dataset**: `datos_percentage.csv`  
**Filter**: `especie == "Salmón Atlántico"`  
**Analysis**: Look at `pct_sec_*` columns to find highest percentage

### Example 3: "How has SRS mortality changed over time?"
**Dataset**: `datos_summary.csv`  
**Visualization**: Line chart with `timepoint` on x-axis, `mort_sec_srs` on y-axis  
**Group by**: `region` or `especie` for comparison

### Example 4: "Create a stacked area chart of mortality causes"
**Dataset**: `datos_percentage.csv`  
**Visualization**: D3.js stacked area chart with `pct_prim_*` columns  
**Result**: Shows changing composition of mortality causes over time

---

## File Formats Available

All datasets are available in CSV format:
- **CSV files** (`.csv`): For use with JavaScript/D3.js, Excel, or other tools

**Recommendation for web visualization**: Use the CSV files with D3.js
