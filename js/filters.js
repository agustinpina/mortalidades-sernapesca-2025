/**
 * filters.js
 * Manages the filter panel UI and filter state
 */

import { CONFIG } from './config.js';

export class FilterManager {
    constructor(dataLoader, onFilterChange) {
        this.dataLoader = dataLoader;
        this.onFilterChange = onFilterChange;

        // Current filter state
        this.state = {
            species: ['Salmón Atlántico'], // Default: Atlantic Salmon
            regions: ['X Región', 'XI Región', 'XII Región'], // Default: Regions X, XI, XII
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
        this.updateScaleAvailability(); // Apply validation rules on init
    }

    /**
     * Populate species checkboxes
     */
    populateSpeciesFilters() {
        const container = document.getElementById('species-filters');
        const species = this.dataLoader.getSpecies();

        container.innerHTML = species.map((s, index) => {
            const id = `species-${index}-${s.replace(/\s+/g, '-').toLowerCase()}`;
            return `
            <label class="checkbox-label" for="${id}">
                <input type="checkbox"
                       id="${id}"
                       name="species"
                       value="${s}"
                       ${this.state.species.includes(s) ? 'checked' : ''}>
                <span>${s}</span>
            </label>
        `}).join('');
    }

    /**
     * Populate region checkboxes
     */
    populateRegionFilters() {
        const container = document.getElementById('region-filters');
        const regions = this.dataLoader.getRegions();

        container.innerHTML = regions.map((r, index) => {
            const id = `region-${index}-${r.replace(/\s+/g, '-').toLowerCase()}`;
            return `
            <label class="checkbox-label" for="${id}">
                <input type="checkbox"
                       id="${id}"
                       name="region"
                       value="${r}"
                       ${this.state.regions.includes(r) ? 'checked' : ''}>
                <span>${r}</span>
            </label>
        `}).join('');
    }

    /**
     * Populate year checkboxes
     */
    populateYearFilters() {
        const container = document.getElementById('year-filters');
        const years = this.dataLoader.getYears();

        container.innerHTML = years.map((y, index) => {
            const id = `year-${index}-${y}`;
            return `
            <label class="checkbox-label" for="${id}">
                <input type="checkbox"
                       id="${id}"
                       name="year"
                       value="${y}"
                       ${this.state.years.includes(y) ? 'checked' : ''}>
                <span>${y}</span>
            </label>
        `}).join('');
    }

    /**
     * Populate primary and secondary cause filters
     */
    populateCauseFilters() {
        // Primary causes
        const primaryContainer = document.getElementById('primary-causes-filters');
        const primaryCauses = this.dataLoader.getPrimaryCauses();

        primaryContainer.innerHTML = primaryCauses.map((c, index) => {
            const id = `primary-${index}-${c.field}`;
            return `
            <label class="checkbox-label" for="${id}">
                <input type="checkbox"
                       id="${id}"
                       name="primary-cause"
                       value="${c.field}">
                <span>${c.label}</span>
            </label>
        `}).join('');

        // Secondary diseases
        const secondaryContainer = document.getElementById('secondary-diseases-filters');
        const secondaryDiseases = this.dataLoader.getSecondaryDiseases();

        secondaryContainer.innerHTML = secondaryDiseases.map((d, index) => {
            const id = `secondary-${index}-${d.field}`;
            return `
            <label class="checkbox-label" for="${id}">
                <input type="checkbox"
                       id="${id}"
                       name="secondary-disease"
                       value="${d.field}">
                <span>${d.label}</span>
            </label>
        `}).join('');
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

        // Panel close button
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

        // Validation: "Mortalidad Total" cannot be used with "Percentage" scale
        if (value === 'total' && this.state.scaleType === 'percentage') {
            // Force scale to absolute
            this.state.scaleType = 'absolute';
            document.getElementById('scale-select').value = 'absolute';
            if (CONFIG.DEBUG) console.log('Auto-switched to absolute scale: Total mortality with percentage is invalid (always 100%)');
        }

        this.updateMetricSections();
        this.updateScaleAvailability();
        this.notifyFilterChange();
    }

    /**
     * Handle scale type change (absolute, percentage)
     */
    handleScaleTypeChange(value) {
        // Validation: "Percentage" cannot be used with "Mortalidad Total"
        if (value === 'percentage' && this.state.metricType === 'total') {
            // Force metric to primary (or keep current if not total)
            this.state.metricType = 'primary';
            document.getElementById('metric-select').value = 'primary';
            if (CONFIG.DEBUG) console.log('Auto-switched to primary causes: Total mortality with percentage is invalid (always 100%)');
            this.updateMetricSections();
        }

        this.state.scaleType = value;
        this.updateScaleAvailability();
        this.notifyFilterChange();
    }

    /**
     * Update scale dropdown availability based on metric type
     */
    updateScaleAvailability() {
        const scaleSelect = document.getElementById('scale-select');
        const percentageOption = scaleSelect.querySelector('option[value="percentage"]');

        if (this.state.metricType === 'total') {
            // Disable percentage option for total mortality
            percentageOption.disabled = true;
            percentageOption.textContent = 'Porcentaje (%) - No disponible con Mortalidad Total';
        } else {
            // Enable percentage option for primary/secondary causes
            percentageOption.disabled = false;
            percentageOption.textContent = 'Porcentaje (%)';
        }
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
     * Also expands the filter panel when Primary or Secondary Causes are selected
     */
    updateMetricSections() {
        const primarySection = document.getElementById('primary-causes-section');
        const secondarySection = document.getElementById('secondary-diseases-section');
        const filterPanel = document.getElementById('filter-panel');

        // Hide both sections by default
        primarySection.style.display = 'none';
        secondarySection.style.display = 'none';

        // Clear all cause checkboxes
        document.querySelectorAll('input[name="primary-cause"]').forEach(cb => cb.checked = false);
        document.querySelectorAll('input[name="secondary-disease"]').forEach(cb => cb.checked = false);

        // Show appropriate section and expand panel if needed
        if (this.state.metricType === 'primary') {
            primarySection.style.display = 'block';
            filterPanel.classList.add('expanded');
        } else if (this.state.metricType === 'secondary') {
            secondarySection.style.display = 'block';
            filterPanel.classList.add('expanded');
        } else {
            // Collapse panel when "Total Mortality" is selected
            filterPanel.classList.remove('expanded');
        }
    }

    /**
     * Update the selection list display with toggle functionality
     */
    updateSelectionList(series, onToggle) {
        const container = document.getElementById('selection-list');
        const countElement = document.getElementById('selection-count');

        countElement.textContent = series.length;

        if (series.length === 0) {
            container.innerHTML = '<p class="empty-state" role="status">No hay series seleccionadas</p>';
            return;
        }

        container.innerHTML = `
            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--spacing-sm);">
                ${series.map(s => `
                    <li class="selection-item ${s.visible ? 'active' : 'inactive'}"
                        data-series-id="${s.id}"
                        role="button"
                        tabindex="0"
                        aria-pressed="${s.visible}"
                        aria-label="${s.visible ? 'Ocultar' : 'Mostrar'} serie: ${s.label}"
                        style="display: flex; align-items: center; gap: var(--spacing-sm); font-size: 0.875rem; padding: var(--spacing-sm); cursor: pointer; border-radius: 4px; transition: all 150ms ease-in-out;">
                        <span class="color-swatch"
                              style="background-color: ${s.color}; width: 12px; height: 12px; border-radius: 2px; flex-shrink: 0; opacity: ${s.visible ? '1' : '0.3'};"
                              role="img"
                              aria-label="Color de la serie"></span>
                        <span style="flex: 1; opacity: ${s.visible ? '1' : '0.5'};">${s.label}</span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" style="opacity: ${s.visible ? '1' : '0.3'};">
                            ${s.visible ?
                                '<path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>' :
                                '<path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/><path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/><path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>'
                            }
                        </svg>
                    </li>
                `).join('')}
            </ul>
        `;

        // Add click and keyboard event listeners
        if (onToggle) {
            container.querySelectorAll('.selection-item').forEach(item => {
                const seriesId = item.getAttribute('data-series-id');

                // Click event
                item.addEventListener('click', () => {
                    onToggle(seriesId);
                });

                // Keyboard event (Enter or Space)
                item.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onToggle(seriesId);
                    }
                });
            });
        }
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
        const overlay = document.getElementById('filter-overlay');
        const toggleBtn = document.getElementById('filter-toggle-btn');
        const isOpen = panel.classList.contains('open');

        if (isOpen) {
            // Close panel
            panel.classList.remove('open');
            overlay.classList.remove('visible');
            panel.setAttribute('aria-hidden', 'true');
            overlay.setAttribute('aria-hidden', 'true');
            toggleBtn?.setAttribute('aria-expanded', 'false');
            toggleBtn?.focus(); // Return focus to toggle button
        } else {
            // Open panel
            panel.classList.add('open');
            overlay.classList.add('visible');
            panel.setAttribute('aria-hidden', 'false');
            overlay.setAttribute('aria-hidden', 'false');
            toggleBtn?.setAttribute('aria-expanded', 'true');

            // Focus first interactive element in panel (reset button)
            const firstButton = panel.querySelector('button');
            if (firstButton) {
                setTimeout(() => firstButton.focus(), 100);
            }
        }
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
