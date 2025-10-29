/**
 * dataLoader.js
 * Handles loading and parsing CSV data from the data folder
 */

export class DataLoader {
    constructor() {
        this.summaryData = null;
    }

    /**
     * Load all necessary CSV files
     */
    async loadData() {
        try {
            // Load summary dataset
            const summaryData = await d3.csv('../data/datos_summary.csv');

            // Parse and enrich the data
            this.summaryData = this.parseData(summaryData);

            return {
                summary: this.summaryData
            };
        } catch (error) {
            console.error('Error loading data:', error);
            throw new Error(`Failed to load CSV data files: ${error.message}`);
        }
    }

    /**
     * Parse CSV data and add computed fields
     */
    parseData(data) {
        return data.map(row => {
            // Extract year and week from timepoint
            const timepointMatch = row.timepoint.match(/Semana (\d+) - \w+ (\d{4})/);
            const weekNumber = timepointMatch ? parseInt(timepointMatch[1]) : null;
            const year = timepointMatch ? parseInt(timepointMatch[2]) : null;
            const month = this.extractMonth(row.timepoint);

            // Convert numeric fields from strings to numbers
            const numericRow = this.convertNumericFields(row);

            return {
                ...numericRow,
                week: weekNumber,
                year: year,
                month: month,
                // Create unique identifier for each series
                seriesId: `${row.especie}_${row.region}_${year}`,
                // Create display label
                displayLabel: `${row.especie} - ${row.region} - ${year}`
            };
        });
    }

    /**
     * Extract month name from timepoint string
     */
    extractMonth(timepoint) {
        const monthMatch = timepoint.match(/- (\w+) \d{4}/);
        return monthMatch ? monthMatch[1] : null;
    }

    /**
     * Convert all numeric string fields to actual numbers
     */
    convertNumericFields(row) {
        const numericFields = [
            'mort_total',
            'mort_total_real',
            'mort_prim_depredadores',
            'mort_prim_embrionaria',
            'mort_prim_eliminacion',
            'mort_prim_ambiental',
            'mort_prim_sin_causa_aparente',
            'mort_prim_secundaria',
            'mort_prim_otras',
            'mort_prim_desadaptado',
            'mort_prim_deforme',
            'mort_prim_dano_mecanico',
            'mort_sec_vibrio',
            'mort_sec_ipn',
            'mort_sec_furunculosis_atipica',
            'mort_sec_bkd',
            'mort_sec_srs',
            'mort_sec_isa',
            'mort_sec_sit',
            'mort_sec_yersiniosis',
            'mort_sec_micosis',
            'mort_sec_francisellosis',
            'mort_sec_flavobacteriosis',
            'mort_sec_amebiasis',
            'mort_sec_sindrome_icterico',
            'mort_sec_hsmi',
            'mort_sec_tenacibaculosis',
            'mort_sec_estreptococosis',
            'mort_sec_ich',
            'mort_sec_exofialosis',
            'mort_sec_shs',
            'mort_sec_nefrocalcinosis',
            'mort_sec_real',
            'n_observaciones'
        ];

        const converted = { ...row };

        numericFields.forEach(field => {
            if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
                converted[field] = parseFloat(row[field]) || 0;
            } else {
                converted[field] = 0;
            }
        });

        return converted;
    }

    /**
     * Get unique values for a specific field
     */
    getUniqueValues(field) {
        if (!this.summaryData) {
            throw new Error('Data not loaded yet');
        }

        const uniqueSet = new Set(this.summaryData.map(row => row[field]));
        return Array.from(uniqueSet).sort();
    }

    /**
     * Get available species
     */
    getSpecies() {
        return this.getUniqueValues('especie');
    }

    /**
     * Get available regions
     */
    getRegions() {
        return this.getUniqueValues('region');
    }

    /**
     * Get available years
     */
    getYears() {
        return this.getUniqueValues('year');
    }

    /**
     * Get primary cause field names and labels
     */
    getPrimaryCauses() {
        return [
            { field: 'mort_prim_depredadores', label: 'Depredadores' },
            { field: 'mort_prim_embrionaria', label: 'Embrionaria' },
            { field: 'mort_prim_eliminacion', label: 'Eliminación' },
            { field: 'mort_prim_ambiental', label: 'Ambiental' },
            { field: 'mort_prim_sin_causa_aparente', label: 'Sin Causa Aparente' },
            { field: 'mort_prim_secundaria', label: 'Secundaria (Enfermedad)' },
            { field: 'mort_prim_otras', label: 'Otras Causas' },
            { field: 'mort_prim_desadaptado', label: 'Desadaptado' },
            { field: 'mort_prim_deforme', label: 'Deforme' },
            { field: 'mort_prim_dano_mecanico', label: 'Daño Mecánico' }
        ];
    }

    /**
     * Get secondary disease field names and labels
     */
    getSecondaryDiseases() {
        return [
            { field: 'mort_sec_srs', label: 'SRS (Piscirickettsiosis)' },
            { field: 'mort_sec_isa', label: 'ISA (Anemia Infecciosa del Salmón)' },
            { field: 'mort_sec_bkd', label: 'BKD (Enfermedad Bacteriana del Riñón)' },
            { field: 'mort_sec_ipn', label: 'IPN (Necrosis Pancreática Infecciosa)' },
            { field: 'mort_sec_tenacibaculosis', label: 'Tenacibaculosis' },
            { field: 'mort_sec_vibrio', label: 'Vibriosis' },
            { field: 'mort_sec_yersiniosis', label: 'Yersiniosis' },
            { field: 'mort_sec_hsmi', label: 'HSMI (Miopatía Cardíaca y Esquelética)' },
            { field: 'mort_sec_francisellosis', label: 'Franciseelosis' },
            { field: 'mort_sec_flavobacteriosis', label: 'Flavobacteriosis' },
            { field: 'mort_sec_furunculosis_atipica', label: 'Furunculosis Atípica' },
            { field: 'mort_sec_estreptococosis', label: 'Estreptococosis' },
            { field: 'mort_sec_amebiasis', label: 'Amebiasis' },
            { field: 'mort_sec_sindrome_icterico', label: 'Síndrome Ictérico' },
            { field: 'mort_sec_micosis', label: 'Micosis' },
            { field: 'mort_sec_sit', label: 'SIT (Síndrome de la Trucha Arcoíris)' },
            { field: 'mort_sec_ich', label: 'Síndrome Ich' },
            { field: 'mort_sec_shs', label: 'SHS (Síndrome Hemorrágico del Salmón)' },
            { field: 'mort_sec_nefrocalcinosis', label: 'Nefrocalcinosis' },
            { field: 'mort_sec_exofialosis', label: 'Exofialosis' }
        ];
    }
}
