/**
 * main.js
 * Main application orchestration
 */

import { CONFIG } from './config.js';
import { DataLoader } from './dataLoader.js';
import { DataTransformer } from './dataTransformer.js';
import { FilterManager } from './filters.js';
import { MortalityChart } from './chart.js';

class MortalityDashboard {
    constructor() {
        this.dataLoader = new DataLoader();
        this.dataTransformer = new DataTransformer();
        this.filterManager = null;
        this.chart = null;
        this.data = null;

        this.init();
    }

    /**
     * Initialize the dashboard
     */
    async init() {
        try {
            // Show loading state
            this.showLoading();

            // Load data
            this.data = await this.dataLoader.loadData();
            if (CONFIG.DEBUG) console.log('Data loaded successfully:', this.data);

            // Initialize chart
            this.chart = new MortalityChart('chart');
            this.chart.initialize();

            // Initialize filter manager with callback
            this.filterManager = new FilterManager(
                this.dataLoader,
                (filterState) => this.handleFilterChange(filterState)
            );
            this.filterManager.initialize();

            // Initialize event listeners
            this.initializeEventListeners();

            // Render initial state
            this.handleFilterChange(this.filterManager.getState());

            if (CONFIG.DEBUG) console.log('Dashboard initialized successfully');
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            this.showError('Failed to load data. Please refresh the page.');
        }
    }

    /**
     * Handle filter changes
     */
    handleFilterChange(filterState) {
        if (CONFIG.DEBUG) console.log('Filter state changed:', filterState);

        // Filter the data
        const filteredData = this.dataTransformer.filterData(
            this.data.summary,
            filterState
        );

        if (CONFIG.DEBUG) console.log('Filtered data:', filteredData);

        // Transform to series
        let series = this.dataTransformer.transformToSeries(
            filteredData,
            filterState
        );

        if (CONFIG.DEBUG) console.log('Series before limit:', series);

        // Apply percentage conversion if needed
        if (filterState.scaleType === 'percentage') {
            series = this.dataTransformer.convertToPercentages(series);
        }

        // Limit to 6 series and check if exceeded
        const { series: limitedSeries, exceeded } = this.dataTransformer.limitSeries(series, 6);

        if (CONFIG.DEBUG) console.log('Series after limit:', limitedSeries, 'Exceeded:', exceeded);

        // Update UI
        this.filterManager.updateSelectionList(limitedSeries);
        this.filterManager.updateResultsCount(limitedSeries.length);
        this.filterManager.showLineLimitWarning(exceeded);

        // Render chart
        this.chart.render(limitedSeries, filterState.scaleType);

        // Update URL with current state (for sharing)
        this.updateURL(filterState);
    }

    /**
     * Initialize additional event listeners
     */
    initializeEventListeners() {
        // Filter panel toggle
        const filterToggleBtn = document.getElementById('filter-toggle-btn');
        const filterPanel = document.getElementById('filter-panel');
        const filterOverlay = document.getElementById('filter-overlay');
        const panelCloseBtn = document.getElementById('panel-close');

        if (filterToggleBtn && filterPanel && filterOverlay) {
            // Open filter panel
            filterToggleBtn.addEventListener('click', () => {
                filterPanel.classList.add('open');
                filterOverlay.classList.add('visible');
                filterPanel.setAttribute('aria-hidden', 'false');
                filterOverlay.setAttribute('aria-hidden', 'false');
                filterToggleBtn.setAttribute('aria-expanded', 'true');
                document.body.style.overflow = 'hidden'; // Prevent body scroll

                // Focus first interactive element in panel
                const firstButton = filterPanel.querySelector('button');
                if (firstButton) {
                    setTimeout(() => firstButton.focus(), 100);
                }
            });

            // Close filter panel
            const closePanel = () => {
                filterPanel.classList.remove('open');
                filterOverlay.classList.remove('visible');
                filterPanel.setAttribute('aria-hidden', 'true');
                filterOverlay.setAttribute('aria-hidden', 'true');
                filterToggleBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = ''; // Restore body scroll
                filterToggleBtn.focus(); // Return focus to toggle button
            };

            if (panelCloseBtn) {
                panelCloseBtn.addEventListener('click', closePanel);
            }

            // Close on overlay click
            filterOverlay.addEventListener('click', closePanel);

            // Close on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && filterPanel.classList.contains('open')) {
                    closePanel();
                }
            });
        }

        // Download chart button
        const downloadBtn = document.getElementById('download-chart');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                // Show download options
                this.showDownloadOptions();
            });
        }

        // Share chart button
        const shareBtn = document.getElementById('share-chart');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareChart();
            });
        }

        // Window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.chart.resize();
            }, 250);
        });
    }

    /**
     * Show download options
     */
    showDownloadOptions() {
        const options = confirm('Download as PNG? (Cancel for SVG)');
        if (options) {
            this.chart.downloadPNG();
        } else {
            this.chart.downloadSVG();
        }
    }

    /**
     * Share chart (copy URL to clipboard)
     */
    async shareChart() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy link:', error);
            // Fallback: show URL in prompt
            prompt('Copy this link:', window.location.href);
        }
    }

    /**
     * Update URL with filter state for sharing
     */
    updateURL(filterState) {
        const params = new URLSearchParams();

        // Encode filter state in URL
        if (filterState.species.length > 0) {
            params.set('species', filterState.species.join(','));
        }
        if (filterState.regions.length > 0) {
            params.set('regions', filterState.regions.join(','));
        }
        if (filterState.years.length > 0) {
            params.set('years', filterState.years.join(','));
        }
        if (filterState.metricType !== 'total') {
            params.set('metric', filterState.metricType);
        }
        if (filterState.selectedCauses.length > 0) {
            params.set('causes', filterState.selectedCauses.join(','));
        }
        if (filterState.scaleType !== 'absolute') {
            params.set('scale', filterState.scaleType);
        }

        // Update URL without reloading page
        const newURL = params.toString() ?
            `${window.location.pathname}?${params.toString()}` :
            window.location.pathname;

        window.history.replaceState({}, '', newURL);
    }

    /**
     * Show loading state
     */
    showLoading() {
        const chartContainer = document.getElementById('chart');
        chartContainer.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #6c757d;">
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem; margin-bottom: 1rem;">Loading data...</div>
                    <div>Please wait while we load the mortality data.</div>
                </div>
            </div>
        `;
    }

    /**
     * Show error message
     */
    showError(message) {
        const chartContainer = document.getElementById('chart');
        chartContainer.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #dc3545;">
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem; margin-bottom: 1rem;">⚠️ Error</div>
                    <div>${message}</div>
                </div>
            </div>
        `;
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (CONFIG.DEBUG) console.log('Initializing Mortality Dashboard...');
    window.dashboard = new MortalityDashboard();
});
