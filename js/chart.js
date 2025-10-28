/**
 * chart.js
 * D3.js chart rendering and interaction logic
 */

export class MortalityChart {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = d3.select(`#${containerId}`);
        this.svg = null;
        this.dimensions = null;
        this.scales = {};
        this.tooltip = null;
        this.currentSeries = [];
        this.scaleType = 'absolute';

        this.initializeTooltip();
    }

    /**
     * Initialize the chart with dimensions
     */
    initialize() {
        // Clear any existing content
        this.container.selectAll('*').remove();

        // Get container dimensions
        const containerNode = this.container.node();
        const width = containerNode.clientWidth;
        const height = containerNode.clientHeight;

        // Set margins
        const margin = { top: 40, right: 40, bottom: 60, left: 80 };

        this.dimensions = {
            width,
            height,
            margin,
            innerWidth: width - margin.left - margin.right,
            innerHeight: height - margin.top - margin.bottom
        };

        // Create SVG
        this.svg = this.container.append('svg')
            .attr('width', width)
            .attr('height', height);

        // Create main group
        this.g = this.svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Create groups for different layers
        this.gridGroup = this.g.append('g').attr('class', 'grid-layer');
        this.linesGroup = this.g.append('g').attr('class', 'lines-layer');
        this.pointsGroup = this.g.append('g').attr('class', 'points-layer');
        this.axesGroup = this.g.append('g').attr('class', 'axes-layer');

        this.initializeScales();
    }

    /**
     * Initialize D3 scales
     */
    initializeScales() {
        const { innerWidth, innerHeight } = this.dimensions;

        // X scale: weeks 1-52
        this.scales.x = d3.scaleLinear()
            .domain([1, 52])
            .range([0, innerWidth]);

        // Y scale: will be updated based on data
        this.scales.y = d3.scaleLinear()
            .range([innerHeight, 0]);
    }

    /**
     * Initialize tooltip
     */
    initializeTooltip() {
        // Create tooltip div if it doesn't exist
        let tooltip = d3.select('body').select('.tooltip');

        if (tooltip.empty()) {
            tooltip = d3.select('body').append('div')
                .attr('class', 'tooltip')
                .style('opacity', 0)
                .style('position', 'absolute');
        }

        this.tooltip = tooltip;
    }

    /**
     * Render the chart with data
     */
    render(series, scaleType = 'absolute') {
        if (!this.svg) {
            this.initialize();
        }

        this.currentSeries = series;
        this.scaleType = scaleType;

        // Update Y scale based on data and scale type
        this.updateYScale(series, scaleType);

        // Render axes
        this.renderAxes(scaleType);

        // Render grid
        this.renderGrid();

        // Render lines
        this.renderLines(series);

        // Render points
        this.renderPoints(series);
    }

    /**
     * Update Y scale based on data
     */
    updateYScale(series, scaleType) {
        let maxValue;

        // Find max value across all series
        maxValue = d3.max(series, s => d3.max(s.values, v => v.value)) || 100;

        // Add 10% padding for better visibility
        maxValue = maxValue * 1.1;

        // For percentage mode, ensure we don't exceed 100% if data is close to it
        // but allow auto-scaling for lower values
        if (scaleType === 'percentage' && maxValue > 100) {
            maxValue = 100;
        }

        this.scales.y.domain([0, maxValue]);
    }

    /**
     * Render axes
     */
    renderAxes(scaleType) {
        const { innerHeight } = this.dimensions;

        // Remove existing axes
        this.axesGroup.selectAll('*').remove();

        // X axis
        const xAxis = d3.axisBottom(this.scales.x)
            .tickValues([1, 5, 9, 14, 18, 22, 27, 31, 35, 40, 44, 48])
            .tickFormat(d => {
                const monthLabels = {
                    1: 'Ene', 5: 'Feb', 9: 'Mar', 14: 'Abr',
                    18: 'May', 22: 'Jun', 27: 'Jul', 31: 'Ago',
                    35: 'Sep', 40: 'Oct', 44: 'Nov', 48: 'Dic'
                };
                return monthLabels[d] || '';
            });

        this.axesGroup.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(xAxis);

        // X axis label
        this.axesGroup.append('text')
            .attr('class', 'axis-label')
            .attr('x', this.dimensions.innerWidth / 2)
            .attr('y', innerHeight + 45)
            .style('text-anchor', 'middle')
            .text('Semana del Año');

        // Y axis
        const yAxis = d3.axisLeft(this.scales.y)
            .ticks(5)
            .tickFormat(d => {
                if (scaleType === 'percentage') {
                    return `${d}%`;
                } else {
                    return d >= 1000 ? `${(d / 1000).toFixed(0)}k` : d;
                }
            });

        this.axesGroup.append('g')
            .attr('class', 'axis y-axis')
            .call(yAxis);

        // Y axis label - horizontal and centered
        this.axesGroup.append('text')
            .attr('class', 'axis-label axis-label-y')
            .attr('x', -10)
            .attr('y', -20)
            .style('text-anchor', 'middle')
            .attr('text-anchor', 'middle')  // Set as attribute to ensure centering
            .text(scaleType === 'percentage' ? '% Mortalidad' : 'N° Muertes');
    }

    /**
     * Render grid lines
     */
    renderGrid() {
        const { innerWidth, innerHeight } = this.dimensions;

        // Remove existing grid
        this.gridGroup.selectAll('*').remove();

        // Horizontal grid lines
        const yTicks = this.scales.y.ticks(5);

        this.gridGroup.selectAll('.grid-line')
            .data(yTicks)
            .enter()
            .append('line')
            .attr('class', 'grid-line')
            .attr('x1', 0)
            .attr('x2', innerWidth)
            .attr('y1', d => this.scales.y(d))
            .attr('y2', d => this.scales.y(d));
    }

    /**
     * Render lines
     */
    renderLines(series) {
        // Line generator
        const line = d3.line()
            .x(d => this.scales.x(d.week))
            .y(d => this.scales.y(d.value))
            .curve(d3.curveMonotoneX);

        // Bind data
        const lines = this.linesGroup.selectAll('.chart-line')
            .data(series, d => d.id);

        // Exit
        lines.exit()
            .transition()
            .duration(300)
            .style('opacity', 0)
            .remove();

        // Enter + Update
        const linesEnter = lines.enter()
            .append('path')
            .attr('class', 'chart-line')
            .style('opacity', 0);

        linesEnter.merge(lines)
            .attr('d', d => line(d.values))
            .attr('stroke', d => d.color)
            .attr('stroke-dasharray', d => d.lineStyle === 'dashed' ? '5,5' : '0')
            .transition()
            .duration(500)
            .style('opacity', 1);

        // Add hover effects
        this.linesGroup.selectAll('.chart-line')
            .on('mouseover', (event, d) => {
                this.highlightSeries(d.id);
            })
            .on('mouseout', () => {
                this.unhighlightSeries();
            });
    }

    /**
     * Render data points
     */
    renderPoints(series) {
        // Flatten all points with complete metadata
        const allPoints = series.flatMap(s =>
            s.values.map(v => ({
                ...v,
                seriesId: s.id,
                color: s.color,
                label: s.label,
                species: s.species,
                region: s.region,
                year: s.year
            }))
        );

        // Bind data
        const points = this.pointsGroup.selectAll('.chart-point')
            .data(allPoints, d => `${d.seriesId}_${d.week}`);

        // Exit
        points.exit()
            .transition()
            .duration(300)
            .attr('r', 0)
            .remove();

        // Enter
        const pointsEnter = points.enter()
            .append('circle')
            .attr('class', 'chart-point')
            .attr('r', 0);

        // Enter + Update
        pointsEnter.merge(points)
            .attr('cx', d => this.scales.x(d.week))
            .attr('cy', d => this.scales.y(d.value))
            .attr('stroke', d => d.color)
            .transition()
            .duration(500)
            .attr('r', 3.5);

        // Add hover effects
        this.pointsGroup.selectAll('.chart-point')
            .on('mouseover', (event, d) => {
                this.showTooltip(event, d);
                // Enlarge point
                d3.select(event.target)
                    .transition()
                    .duration(150)
                    .attr('r', 6);
            })
            .on('mouseout', (event) => {
                this.hideTooltip();
                // Restore point size
                d3.select(event.target)
                    .transition()
                    .duration(150)
                    .attr('r', 3.5);
            });
    }

    /**
     * Show tooltip
     */
    showTooltip(event, data) {
        // Input validation
        if (!data || !data.species || !data.region || data.week === undefined) {
            console.warn('Invalid or incomplete tooltip data:', data);
            return;
        }

        // Sanitize HTML to prevent XSS
        const sanitize = (str) => {
            if (typeof str !== 'string') return '';
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };

        const formatValue = (value) => {
            if (value === null || value === undefined) return 'N/A';
            if (this.scaleType === 'percentage') {
                return `${value.toFixed(1)}%`;
            } else {
                return value.toLocaleString('es-CL');
            }
        };

        const html = `
            <div class="tooltip-header">
                <div class="tooltip-title">${sanitize(data.label)}</div>
                <div class="tooltip-subtitle">${sanitize(data.timepoint)}</div>
            </div>
            <div class="tooltip-body">
                <div class="tooltip-row">
                    <span class="tooltip-label">Semana</span>
                    <span class="tooltip-value">${data.week}</span>
                </div>
                <div class="tooltip-row">
                    <span class="tooltip-label">Mes</span>
                    <span class="tooltip-value">${sanitize(data.month)}</span>
                </div>
                <div class="tooltip-row">
                    <span class="tooltip-label">Año</span>
                    <span class="tooltip-value">${data.year}</span>
                </div>
                <div class="tooltip-row">
                    <span class="tooltip-label">Valor</span>
                    <span class="tooltip-value">${formatValue(data.value)}</span>
                </div>
            </div>
        `;

        this.tooltip
            .html(html)
            .attr('role', 'tooltip')
            .attr('aria-live', 'polite')
            .style('left', `${event.pageX + 15}px`)
            .style('top', `${event.pageY - 28}px`)
            .transition()
            .duration(200)
            .style('opacity', 1);
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        this.tooltip
            .transition()
            .duration(200)
            .style('opacity', 0);
    }

    /**
     * Highlight a specific series
     */
    highlightSeries(seriesId) {
        this.linesGroup.selectAll('.chart-line')
            .classed('highlighted', d => d.id === seriesId)
            .classed('dimmed', d => d.id !== seriesId);

        this.pointsGroup.selectAll('.chart-point')
            .style('opacity', d => d.seriesId === seriesId ? 1 : 0.3);
    }

    /**
     * Remove highlighting
     */
    unhighlightSeries() {
        this.linesGroup.selectAll('.chart-line')
            .classed('highlighted', false)
            .classed('dimmed', false);

        this.pointsGroup.selectAll('.chart-point')
            .style('opacity', 1);
    }

    /**
     * Handle window resize
     */
    resize() {
        this.initialize();
        this.render(this.currentSeries, this.scaleType);
    }

    /**
     * Download chart as PNG
     */
    downloadPNG() {
        const svgNode = this.svg.node();
        const svgString = new XMLSerializer().serializeToString(svgNode);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = this.dimensions.width * 2; // 2x for better quality
        canvas.height = this.dimensions.height * 2;

        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);

            canvas.toBlob((blob) => {
                const downloadUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `salmon-mortality-chart-${Date.now()}.png`;
                link.href = downloadUrl;
                link.click();
                URL.revokeObjectURL(downloadUrl);
            });
        };

        img.src = url;
    }

    /**
     * Download chart as SVG
     */
    downloadSVG() {
        const svgNode = this.svg.node();
        const svgString = new XMLSerializer().serializeToString(svgNode);
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.download = `salmon-mortality-chart-${Date.now()}.svg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }
}
