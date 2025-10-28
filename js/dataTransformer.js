/**
 * dataTransformer.js
 * Handles data filtering, aggregation, and transformation for visualization
 */

export class DataTransformer {
    constructor() {
        this.colorScale = d3.scaleOrdinal()
            .range([
                '#1f77b4', // Blue
                '#ff7f0e', // Orange
                '#2ca02c', // Green
                '#d62728', // Red
                '#9467bd', // Purple
                '#8c564b', // Brown
                '#e377c2', // Pink
                '#7f7f7f'  // Gray
            ]);
    }

    /**
     * Filter data based on current filter state
     * @param {Array} data - Source data
     * @param {Object} filters - Filter configuration
     * @returns {Array} Filtered data
     */
    filterData(data, filters) {
        return data.filter(row => {
            // Filter by species
            if (filters.species.length > 0 && !filters.species.includes(row.especie)) {
                return false;
            }

            // Filter by region
            if (filters.regions.length > 0 && !filters.regions.includes(row.region)) {
                return false;
            }

            // Filter by year
            if (filters.years.length > 0 && !filters.years.includes(row.year)) {
                return false;
            }

            return true;
        });
    }

    /**
     * Transform filtered data into series for chart visualization
     * @param {Array} filteredData - Filtered data
     * @param {Object} filters - Filter configuration
     * @returns {Array} Array of series objects
     */
    transformToSeries(filteredData, filters) {
        const { metricType, selectedCauses, scaleType } = filters;

        // Determine which field to use for the metric
        let metricField = 'mort_total_real';
        let isPercentage = scaleType === 'percentage';

        // If specific causes are selected, we need to create series for each cause
        if (metricType === 'primary' || metricType === 'secondary') {
            return this.createCauseSeries(filteredData, filters);
        }

        // For total mortality, create series for each species-region-year combination
        return this.createTotalMortalitySeries(filteredData, metricField);
    }

    /**
     * Create series for total mortality (species x region x year)
     */
    createTotalMortalitySeries(data, metricField) {
        // Group by seriesId
        const grouped = d3.group(data, d => d.seriesId);

        const series = [];
        let colorIndex = 0;

        grouped.forEach((values, seriesId) => {
            // Sort by week number
            const sortedValues = values.sort((a, b) => a.week - b.week);

            const serie = {
                id: seriesId,
                label: values[0].displayLabel,
                species: values[0].especie,
                region: values[0].region,
                year: values[0].year,
                color: this.colorScale(colorIndex++),
                lineStyle: values[0].year === 2024 ? 'solid' : 'dashed',
                values: sortedValues.map(d => ({
                    week: d.week,
                    value: d[metricField],
                    month: d.month,
                    timepoint: d.timepoint,
                    rawData: d
                }))
            };

            series.push(serie);
        });

        return series;
    }

    /**
     * Create series for specific causes (primary or secondary)
     */
    createCauseSeries(data, filters) {
        const { metricType, selectedCauses, species, regions, years } = filters;

        // If no specific causes selected, return empty
        if (!selectedCauses || selectedCauses.length === 0) {
            return [];
        }

        const series = [];
        let colorIndex = 0;

        // For each selected cause, create series for each species-region-year combination
        selectedCauses.forEach(causeField => {
            // Get the label for this cause
            const causeLabel = this.getCauseLabel(causeField, metricType);

            // Group by species, region, and year
            const combinations = this.getUniqueCombinations(data, species, regions, years);

            combinations.forEach(combo => {
                // Filter data for this specific combination
                const comboData = data.filter(d =>
                    d.especie === combo.species &&
                    d.region === combo.region &&
                    d.year === combo.year
                ).sort((a, b) => a.week - b.week);

                if (comboData.length === 0) return;

                const serie = {
                    id: `${combo.species}_${combo.region}_${combo.year}_${causeField}`,
                    label: `${causeLabel} - ${combo.species} - ${combo.region} - ${combo.year}`,
                    species: combo.species,
                    region: combo.region,
                    year: combo.year,
                    cause: causeField,
                    color: this.colorScale(colorIndex++),
                    lineStyle: combo.year === 2024 ? 'solid' : 'dashed',
                    values: comboData.map(d => ({
                        week: d.week,
                        value: d[causeField],
                        month: d.month,
                        timepoint: d.timepoint,
                        rawData: d
                    }))
                };

                series.push(serie);
            });
        });

        return series;
    }

    /**
     * Get unique combinations of species, regions, and years
     */
    getUniqueCombinations(data, species, regions, years) {
        const combinations = [];
        const seen = new Set();

        data.forEach(d => {
            const key = `${d.especie}_${d.region}_${d.year}`;
            if (!seen.has(key)) {
                seen.add(key);
                combinations.push({
                    species: d.especie,
                    region: d.region,
                    year: d.year
                });
            }
        });

        return combinations;
    }

    /**
     * Get human-readable label for a cause field
     */
    getCauseLabel(causeField, metricType) {
        // This would typically reference the DataLoader's cause lists
        // For now, create a simple mapping
        const labelMap = {
            // Primary causes
            'mort_prim_depredadores': 'Predators',
            'mort_prim_embrionaria': 'Embryonic',
            'mort_prim_eliminacion': 'Culling',
            'mort_prim_ambiental': 'Environmental',
            'mort_prim_sin_causa_aparente': 'No Apparent Cause',
            'mort_prim_secundaria': 'Disease',
            'mort_prim_otras': 'Other Causes',
            'mort_prim_desadaptado': 'Maladapted',
            'mort_prim_deforme': 'Deformed',
            'mort_prim_dano_mecanico': 'Mechanical Damage',
            // Secondary diseases
            'mort_sec_srs': 'SRS',
            'mort_sec_isa': 'ISA',
            'mort_sec_bkd': 'BKD',
            'mort_sec_ipn': 'IPN',
            'mort_sec_tenacibaculosis': 'Tenacibaculosis',
            'mort_sec_vibrio': 'Vibriosis',
            'mort_sec_yersiniosis': 'Yersiniosis',
            'mort_sec_hsmi': 'HSMI',
            'mort_sec_francisellosis': 'Francisellosis',
            'mort_sec_flavobacteriosis': 'Flavobacteriosis',
            'mort_sec_furunculosis_atipica': 'Atypical Furunculosis',
            'mort_sec_estreptococosis': 'Streptococcosis',
            'mort_sec_amebiasis': 'Amebiasis',
            'mort_sec_sindrome_icterico': 'Jaundice Syndrome',
            'mort_sec_micosis': 'Mycosis',
            'mort_sec_sit': 'SIT',
            'mort_sec_ich': 'Ich',
            'mort_sec_shs': 'SHS',
            'mort_sec_nefrocalcinosis': 'Nephrocalcinosis',
            'mort_sec_exofialosis': 'Exophiala'
        };

        return labelMap[causeField] || causeField;
    }

    /**
     * Convert absolute values to percentages based on total
     * @param {Array} series - Series data
     * @returns {Array} Series with percentage values
     */
    convertToPercentages(series) {
        return series.map(serie => {
            const convertedValues = serie.values.map(point => {
                // Calculate percentage based on total mortality
                const total = point.rawData.mort_total_real;
                const percentage = total > 0 ? (point.value / total) * 100 : 0;

                return {
                    ...point,
                    value: percentage,
                    originalValue: point.value
                };
            });

            return {
                ...serie,
                values: convertedValues
            };
        });
    }

    /**
     * Limit series to maximum of 6 lines
     * @param {Array} series - Series data
     * @param {Number} maxLines - Maximum number of lines (default: 6)
     * @returns {Object} { series: limited series, exceeded: boolean }
     */
    limitSeries(series, maxLines = 6) {
        if (series.length <= maxLines) {
            return { series, exceeded: false };
        }

        // Sort by total mortality (sum of all values) and take top 6
        const sortedSeries = series
            .map(s => ({
                ...s,
                total: d3.sum(s.values, v => v.value)
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, maxLines);

        return {
            series: sortedSeries,
            exceeded: true
        };
    }

    /**
     * Get week labels for X-axis
     * @returns {Array} Array of week numbers 1-52
     */
    getWeekLabels() {
        return d3.range(1, 53);
    }

    /**
     * Get month labels for specific weeks
     * @returns {Array} Array of objects with week and month
     */
    getMonthLabels() {
        // Approximate week numbers for each month (based on Chilean calendar)
        return [
            { week: 1, month: 'Enero', shortMonth: 'Ene' },
            { week: 5, month: 'Febrero', shortMonth: 'Feb' },
            { week: 9, month: 'Marzo', shortMonth: 'Mar' },
            { week: 14, month: 'Abril', shortMonth: 'Abr' },
            { week: 18, month: 'Mayo', shortMonth: 'May' },
            { week: 22, month: 'Junio', shortMonth: 'Jun' },
            { week: 27, month: 'Julio', shortMonth: 'Jul' },
            { week: 31, month: 'Agosto', shortMonth: 'Ago' },
            { week: 35, month: 'Septiembre', shortMonth: 'Sep' },
            { week: 40, month: 'Octubre', shortMonth: 'Oct' },
            { week: 44, month: 'Noviembre', shortMonth: 'Nov' },
            { week: 48, month: 'Diciembre', shortMonth: 'Dic' }
        ];
    }

    /**
     * Calculate summary statistics for a series
     */
    calculateStats(series) {
        return series.map(s => ({
            ...s,
            stats: {
                min: d3.min(s.values, v => v.value),
                max: d3.max(s.values, v => v.value),
                mean: d3.mean(s.values, v => v.value),
                total: d3.sum(s.values, v => v.value)
            }
        }));
    }
}
