/**
 * filters.js
 * Manages the filter panel UI and filter state
 */

export class FilterManager {
    constructor(dataLoader, onFilterChange) {
        this.dataLoader = dataLoader;
        this.onFilterChange = onFilterChange;

        // Current filter state
        this.state = {
            species: ['Salmón Atlántico'], // Default: Atlantic Salmon
            regions: ['X Región'], // 
            years: [2024, 2025], // Both years
            metricType: 'total', // 'total', 'primary', or 'secondary'
            selectedCauses: [], // Array of cause field names
            scaleType: 'absolute' // 'absolute' or 'percentage'
        };

        this.initializeEventListeners();
    }

    /**
     * Initialize the filter panel UI
     */
    initialize() {
        this.populateSpeciesFilters();
        this.populateRegionFilters();
        this.populateYearFilters();
        this.populateCauseFilters();
        this.updateMetricSections();
        this.applyInitialState();
    }

    /**
     * Populate species checkboxes
     */
    populateSpeciesFilters() {
        const container = document.getElementById('species-filters');
        const species = this.dataLoader.getSpecies();

        container.innerHTML = species.map(s => `
            <label class="checkbox-label">
                <input type="checkbox" name="species" value="${s}"
                    ${this.state.species.includes(s) ? 'checked' : ''}>
                <span>${s}</span>
            </label>
        `).join('');
    }

    /**
     * Populate region checkboxes
     */
    populateRegionFilters() {
        const container = document.getElementById('region-filters');
        const regions = this.dataLoader.getRegions();

        container.innerHTML = regions.map(r => `
            <label class="checkbox-label">
                <input type="checkbox" name="region" value="${r}"
                    ${this.state.regions.includes(r) ? 'checked' : ''}>
                <span>${r}</span>
            </label>
        `).join('');
    }

    /**
     * Populate year checkboxes
     */
    populateYearFilters() {
        const container = document.getElementById('year-filters');
        const years = this.dataLoader.getYears();

        container.innerHTML = years.map(y => `
            <label class="checkbox-label">
                <input type="checkbox" name="year" value="${y}"
                    ${this.state.years.includes(y) ? 'checked' : ''}>
                <span>${y}</span>
            </label>
        `).join('');
    }

    /**
     * Populate primary and secondary cause filters
     */
    populateCauseFilters() {
        // Primary causes
        const primaryContainer = document.getElementById('primary-causes-filters');
        const primaryCauses = this.dataLoader.getPrimaryCauses();

        primaryContainer.innerHTML = primaryCauses.map(c => `
            <label class="checkbox-label">
                <input type="checkbox" name="primary-cause" value="${c.field}">
                <span>${c.label}</span>
            </label>
        `).join('');

        // Secondary diseases
        const secondaryContainer = document.getElementById('secondary-diseases-filters');
        const secondaryDiseases = this.dataLoader.getSecondaryDiseases();

        secondaryContainer.innerHTML = secondaryDiseases.map(d => `
            <label class="checkbox-label">
                <input type="checkbox" name="secondary-disease" value="${d.field}">
                <span>${d.label}</span>
            </label>
        `).join('');
    }

    /**
     * Apply initial state to UI
     */
    applyInitialState() {
        // Set metric type select
        document.getElementById('metric-select').value = this.state.metricType;

        // Set scale type select
        document.getElementById('scale-select').value = this.state.scaleType;
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Species checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.name === 'species') {
                this.handleSpeciesChange();
            }
        });

        // Region checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.name === 'region') {
                this.handleRegionChange();
            }
        });

        // Year checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.name === 'year') {
                this.handleYearChange();
            }
        });

        // Metric type select dropdown
        document.getElementById('metric-select').addEventListener('change', (e) => {
            this.handleMetricTypeChange(e.target.value);
        });

        // Scale type select dropdown
        document.getElementById('scale-select').addEventListener('change', (e) => {
            this.handleScaleTypeChange(e.target.value);
        });

        // Primary cause checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.name === 'primary-cause') {
                this.handleCauseChange();
            }
        });

        // Secondary disease checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.name === 'secondary-disease') {
                this.handleCauseChange();
            }
        });

        // Clear selection button
        document.getElementById('clear-selection')?.addEventListener('click', () => {
            this.clearAllSelections();
        });

        // Reset filters button
        document.getElementById('reset-filters')?.addEventListener('click', () => {
            this.resetToDefaults();
        });

        // Mobile toggle buttons
        document.getElementById('settings-toggle')?.addEventListener('click', () => {
            this.togglePanel();
        });

        document.getElementById('panel-close')?.addEventListener('click', () => {
            this.togglePanel();
        });
    }

    /**
     * Handle species checkbox changes
     */
    handleSpeciesChange() {
        const checked = Array.from(document.querySelectorAll('input[name="species"]:checked'))
            .map(cb => cb.value);

        this.state.species = checked;
        this.notifyFilterChange();
    }

    /**
     * Handle region checkbox changes
     */
    handleRegionChange() {
        const checked = Array.from(document.querySelectorAll('input[name="region"]:checked'))
            .map(cb => cb.value);

        this.state.regions = checked;
        this.notifyFilterChange();
    }

    /**
     * Handle year checkbox changes
     */
    handleYearChange() {
        const checked = Array.from(document.querySelectorAll('input[name="year"]:checked'))
            .map(cb => parseInt(cb.value));

        this.state.years = checked;
        this.notifyFilterChange();
    }

    /**
     * Handle metric type change (total, primary, secondary)
     */
    handleMetricTypeChange(value) {
        this.state.metricType = value;
        this.state.selectedCauses = []; // Clear selected causes when switching metric type
        this.updateMetricSections();
        this.notifyFilterChange();
    }

    /**
     * Handle scale type change (absolute, percentage)
     */
    handleScaleTypeChange(value) {
        this.state.scaleType = value;
        this.notifyFilterChange();
    }

    /**
     * Handle cause checkbox changes (primary or secondary)
     */
    handleCauseChange() {
        if (this.state.metricType === 'primary') {
            const checked = Array.from(document.querySelectorAll('input[name="primary-cause"]:checked'))
                .map(cb => cb.value);
            this.state.selectedCauses = checked;
        } else if (this.state.metricType === 'secondary') {
            const checked = Array.from(document.querySelectorAll('input[name="secondary-disease"]:checked'))
                .map(cb => cb.value);
            this.state.selectedCauses = checked;
        }

        this.notifyFilterChange();
    }

    /**
     * Show/hide cause filter sections based on metric type
     */
    updateMetricSections() {
        const primarySection = document.getElementById('primary-causes-section');
        const secondarySection = document.getElementById('secondary-diseases-section');

        // Hide both sections by default
        primarySection.style.display = 'none';
        secondarySection.style.display = 'none';

        // Clear all cause checkboxes
        document.querySelectorAll('input[name="primary-cause"]').forEach(cb => cb.checked = false);
        document.querySelectorAll('input[name="secondary-disease"]').forEach(cb => cb.checked = false);

        // Show appropriate section
        if (this.state.metricType === 'primary') {
            primarySection.style.display = 'block';
        } else if (this.state.metricType === 'secondary') {
            secondarySection.style.display = 'block';
        }
    }

    /**
     * Update the selection list display
     */
    updateSelectionList(series) {
        const container = document.getElementById('selection-list');
        const countElement = document.getElementById('selection-count');

        countElement.textContent = series.length;

        if (series.length === 0) {
            container.innerHTML = '<p class="empty-state">No hay series seleccionadas</p>';
            return;
        }

        container.innerHTML = series.map(s => `
            <div class="selection-item">
                <div class="color-swatch" style="background-color: ${s.color}"></div>
                <span>${s.label}</span>
            </div>
        `).join('');
    }

    /**
     * Show/hide line limit warning
     */
    showLineLimitWarning(exceeded) {
        const warning = document.getElementById('line-limit-warning');
        warning.style.display = exceeded ? 'block' : 'none';
    }

    /**
     * Update results count
     */
    updateResultsCount(count) {
        const countElement = document.getElementById('results-count');
        countElement.textContent = `${count} Resultado${count !== 1 ? 's' : ''}`;
    }

    /**
     * Clear all selections
     */
    clearAllSelections() {
        // Uncheck all checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });

        // Reset state
        this.state.species = [];
        this.state.regions = [];
        this.state.years = [];
        this.state.selectedCauses = [];

        this.notifyFilterChange();
    }

    /**
     * Reset to default state
     */
    resetToDefaults() {
        this.state = {
            species: ['Salmón Atlántico'],
            regions: ['X Región', 'XI Región', 'XII Región'],
            years: [2024, 2025],
            metricType: 'total',
            selectedCauses: [],
            scaleType: 'absolute'
        };

        // Update UI to reflect defaults
        this.populateSpeciesFilters();
        this.populateRegionFilters();
        this.populateYearFilters();
        this.applyInitialState();
        this.updateMetricSections();

        this.notifyFilterChange();
    }

    /**
     * Toggle mobile panel visibility
     */
    togglePanel() {
        const panel = document.getElementById('filter-panel');
        panel.classList.toggle('open');
    }

    /**
     * Notify parent component of filter changes
     */
    notifyFilterChange() {
        if (this.onFilterChange) {
            this.onFilterChange(this.state);
        }
    }

    /**
     * Get current filter state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Set filter state programmatically
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        // Re-populate UI to reflect new state
        this.populateSpeciesFilters();
        this.populateRegionFilters();
        this.populateYearFilters();
        this.applyInitialState();
        this.updateMetricSections();
        this.notifyFilterChange();
    }
}
