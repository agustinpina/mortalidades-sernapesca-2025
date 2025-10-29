/**
 * main.js
 * Main application orchestration
 */

import { CONFIG } from './config.js';
import { DataLoader } from './dataLoader.js';
import { DataTransformer } from './dataTransformer.js';
import { FilterManager } from './filters.js';
import { MortalityChart } from './chart.js';

/**
 * ModalManager - Handles share modal functionality
 */
class ModalManager {
    constructor() {
        this.modal = document.getElementById('share-modal-overlay');
        this.closeBtn = document.getElementById('share-modal-close');
        this.copyBtn = document.getElementById('copy-link-btn');
        this.linkInput = document.getElementById('share-link-input');
        this.lastFocusedElement = null;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Close modal button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        // Close on overlay click
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('visible')) {
                this.close();
            }
        });

        // Copy link button
        if (this.copyBtn) {
            this.copyBtn.addEventListener('click', () => this.copyLink());
        }
    }

    open() {
        // Store currently focused element
        this.lastFocusedElement = document.activeElement;

        // Populate link input with current URL
        if (this.linkInput) {
            this.linkInput.value = window.location.href;
        }

        // Show modal
        if (this.modal) {
            this.modal.classList.add('visible');
            document.body.style.overflow = 'hidden';

            // Focus copy button after modal opens
            setTimeout(() => {
                if (this.copyBtn) {
                    this.copyBtn.focus();
                }
            }, 100);
        }
    }

    close() {
        if (this.modal) {
            this.modal.classList.remove('visible');
            document.body.style.overflow = '';

            // Return focus to last focused element
            if (this.lastFocusedElement) {
                this.lastFocusedElement.focus();
            }
        }
    }

    async copyLink() {
        try {
            await navigator.clipboard.writeText(this.linkInput.value);

            // Update button text temporarily
            const originalText = this.copyBtn.innerHTML;
            this.copyBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </svg>
                Copiado
            `;

            // Restore original text after 2 seconds
            setTimeout(() => {
                this.copyBtn.innerHTML = originalText;
            }, 2000);
        } catch (error) {
            console.error('Failed to copy link:', error);
            // Fallback: select the input text
            this.linkInput.select();
        }
    }
}

class MortalityDashboard {
    constructor() {
        this.dataLoader = new DataLoader();
        this.dataTransformer = new DataTransformer();
        this.filterManager = null;
        this.chart = null;
        this.data = null;
        this.modalManager = new ModalManager();
        this.currentSeries = []; // Store current series with visibility state

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

        // Add 'visible' property to each series (default: true)
        // Preserve visibility state from previous series if they exist
        limitedSeries.forEach(s => {
            const existingSeries = this.currentSeries.find(cs => cs.id === s.id);
            s.visible = existingSeries ? existingSeries.visible : true;
        });

        // Store current series
        this.currentSeries = limitedSeries;

        // Update UI
        this.filterManager.updateSelectionList(limitedSeries, (seriesId) => this.toggleSeriesVisibility(seriesId));
        this.filterManager.updateResultsCount(limitedSeries.length);
        this.filterManager.showLineLimitWarning(exceeded);

        // Render chart (only visible series)
        const visibleSeries = limitedSeries.filter(s => s.visible);
        this.chart.render(visibleSeries, filterState.scaleType);

        // Update URL with current state (for sharing)
        this.updateURL(filterState);
    }

    /**
     * Toggle series visibility (soft deselection)
     */
    toggleSeriesVisibility(seriesId) {
        if (CONFIG.DEBUG) console.log('Toggling visibility for series:', seriesId);

        // Find and toggle the series
        const seriesItem = this.currentSeries.find(s => s.id === seriesId);
        if (seriesItem) {
            seriesItem.visible = !seriesItem.visible;

            // Update UI
            this.filterManager.updateSelectionList(this.currentSeries, (id) => this.toggleSeriesVisibility(id));

            // Re-render chart with visible series only
            const visibleSeries = this.currentSeries.filter(s => s.visible);
            this.chart.render(visibleSeries, this.filterManager.getState().scaleType);

            if (CONFIG.DEBUG) console.log('Series visibility toggled:', seriesItem.label, 'visible:', seriesItem.visible);
        }
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
     * Show "Coming Soon" notification for download button
     */
    showDownloadOptions() {
        const downloadBtn = document.getElementById('download-chart');
        if (!downloadBtn) return;

        // Check if notification already exists
        const existingNotification = downloadBtn.parentElement.querySelector('.coming-soon-notification');
        if (existingNotification) return;

        // Create notification element
        const notification = document.createElement('span');
        notification.className = 'coming-soon-notification';
        notification.textContent = 'Próximamente';
        notification.setAttribute('role', 'status');
        notification.setAttribute('aria-live', 'polite');

        // Position relative to button
        downloadBtn.parentElement.style.position = 'relative';

        // Add to DOM
        downloadBtn.parentElement.appendChild(notification);

        // Remove after animation completes (2 seconds)
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    /**
     * Share chart - Opens modal with link and LinkedIn CTA
     */
    shareChart() {
        this.modalManager.open();
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
