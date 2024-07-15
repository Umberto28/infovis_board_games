document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    const width = 350,
    height = 350,
    margin = 40;

    const radius = Math.min(width, height) / 2 - margin
    const arc = d3.arc().innerRadius(radius/2).outerRadius(radius);

    // append the svg object to the div called 'my_dataviz'
    const svg = d3.select("#pie")
    .append("svg")
        .attr("width", width)
        .attr("height", height)
    .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const barWidth = 350;
    const barHeight = 350;
    const barMargin = {top: 20, right: 20, bottom: 30, left: 40};

    const x = d3.scaleBand().rangeRound([0, barWidth]).padding(0.1);
    const y = d3.scaleLinear().rangeRound([barHeight, 0]);

    const barSvg = d3.select('#bar')
                    .append('svg')
                    .attr('width', barWidth + barMargin.left + barMargin.right)
                    .attr('height', barHeight + barMargin.top + barMargin.bottom)
                    .append('g')
                    .attr('transform', `translate(${barMargin.left},${barMargin.top})`);

    // Create dummy data
    const fetchData = (params = {}) => {
        let url = '/api/boardgames_cluster';
        let queryParams = new URLSearchParams(params).toString();
        if (queryParams) {
            url += `?${queryParams}`;
        }
        return fetch(url)
            .then(response => response.json());
    };
    
    document.querySelectorAll('.clusterbtn').forEach(button => {
        button.addEventListener('click', () => {
            fetchData(button.id).then(data => updateCharts(data));
        });
    });

    const createCharts = (data) => {
        // set the color scale
        const color = d3.scaleOrdinal()
            .domain(Object.keys(data))
            .range(d3.schemeCategory10)

        const pie = d3.pie().value(d=>d[1])
        const data_ready = pie(Object.entries(data))

        // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        svg
        .selectAll('path')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data[0]))
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.8)
        .each(function(d) { this._current = d; });

        // Create the initial bar chart
        x.domain(Object.keys(data));
        y.domain([0, d3.max(Object.values(data))]);
        
        barSvg.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0,${barHeight})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
              .attr('transform', 'rotate(45)')
              .style('text-anchor', 'start');

        barSvg.append('g')
            .attr('class', 'axis axis--y')
            .call(d3.axisLeft(y).ticks(10));

        barSvg.selectAll('.bar')
            .data(Object.entries(data))
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d[0]))
            .attr('y', d => y(d[1]))
            .attr('width', x.bandwidth())
            .attr('height', d => barHeight - y(d[1]))
            .attr('fill', d => color(d[0]));
    }
    
    const updateCharts = (data) => {
        // set the color scale
        const color = d3.scaleOrdinal()
            .domain(Object.keys(data))
            .range(d3.schemeCategory10)
        
        const pie = d3.pie().value(d=>d[1])
        const data_ready = pie(Object.entries(data))
        const arcs = svg.selectAll('path').data(data_ready);

        arcs.transition()
            .duration(750)
            .attrTween('d', function(d) {
                const interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return t => arc(interpolate(t));
            });

        arcs.enter()
            .append('path')
            .attr('fill', d => color(d.data[0]))
            .attr("stroke", "black")
            .style("stroke-width", "2px")
            .style("opacity", 0.8)
            .each(function(d) { this._current = d; }) // store the initial angles
            .transition()
            .duration(750)
            .attrTween('d', function(d) {
                const interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return t => arc(interpolate(t));
            });

        arcs.exit().remove();

        // Update Bar Chart
        x.domain(Object.keys(data));
        y.domain([0, d3.max(Object.values(data))]);

        const bars = barSvg.selectAll('.bar').data(Object.entries(data));

        bars.exit().remove();        

        bars.transition()
            .duration(750)
            .attr('x', d => x(d[0]))
            .attr('y', d => y(d[1]))
            .attr('width', x.bandwidth())
            .attr('height', d => barHeight - y(d[1]))
            .attr('fill', d => color(d[0]));

        bars.enter()
            .append('rect')
            .transition()
            .duration(750)
            .attr('class', 'bar')
            .attr('x', d => x(d[0]))
            .attr('y', d => y(d[1]))
            .attr('width', x.bandwidth())
            .attr('height', d => barHeight - y(d[1]))
            .attr('fill', d => color(d[0]))
            .merge(bars)  // Merge the new bars with existing ones
            .transition()
            .duration(750)
            .attr('x', d => x(d[0]))
            .attr('y', d => y(d[1]))
            .attr('width', x.bandwidth())
            .attr('height', d => barHeight - y(d[1]))
            .attr('fill', d => color(d[0]));

        // Update axes
        barSvg.select('.axis--x')
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('transform', 'rotate(45)')
            .style('text-anchor', 'start');

        barSvg.select('.axis--y')
            .call(d3.axisLeft(y).ticks(10));
    }

    fetchData('year').then(data => createCharts(data));
});
