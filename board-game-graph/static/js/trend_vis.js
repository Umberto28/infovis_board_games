document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    // Color palette for charts
    const color = d3.scaleOrdinal().range(['#85edc3', '#e6a766', '#5288e4', '#e09793', '#af91df', '#dab974', '#53d55a', '#97f1a3', '#a7e290', '#e4d14f', '#e99561', '#3be8a7', '#9ae6b8', '#e6255c', '#d38664', '#7fdeed', '#b0dd9a', '#7097d3', '#4ac8d4', '#e9bcac', '#df9daa', '#e48e9c', '#948ce2', '#a5eedc', '#de938a', '#e04da1', '#dcca85', '#edd7a0', '#d2789f', '#c4ef9b', '#6fbae1', '#eae655', '#2edc3d', '#51c2e1', '#d14ca9', '#dd8470', '#c2ea4f', '#e05789', '#e3b96f', '#bb5ae8', '#475bc5', '#94ebc4', '#d264dc', '#3a33de', '#8972da', '#70e7e2', '#91e2d9', '#a4b3ef', '#cfee9d', '#e03e64', '#b29add', '#c691e6', '#93d77c', '#6a6fe4', '#e04c58', '#48b3d9', '#cd66c3', '#d151e9', '#e285b3', '#dc8eb8', '#9f62d1', '#5ace7c', '#dc67ea', '#dd2873', '#d8e4a1', '#79b4e9', '#abd059', '#59b1d6', '#f1a5e4', '#b537e8', '#a7e772', '#d9d16f', '#a9ebd9', '#cad581', '#c57a41', '#995cd5', '#d1d935', '#6bd762', '#3c4dd0', '#94eff0', '#e4e489', '#e063de', '#8887d9', '#aae6be', '#89d98a', '#69e8e0', '#de74e1', '#9ce192', '#87d798', '#a77ce2', '#cb79e5', '#3660e1', '#c6e48a', '#a6c2e4', '#e29771', '#9b8be8', '#72edac', '#b5ea90', '#77e563', '#50e6b5', '#e367c4', '#e6ce4c', '#59a2d8', '#ed8dd8', '#ad92ec', '#442cd4', '#9e46dd', '#e88c7e', '#c6944c', '#5bde92', '#ec5eb6', '#ddef99', '#cae5ab', '#81d5c4', '#436ec9', '#e19cde', '#e88b8b', '#7db1e6', '#e99f60', '#e26b6e', '#97e184', '#39dc64', '#48b0c5'])

    // Create svg for line chart
    const lineMargin = {top: 30, right: 30, bottom: 100, left: 40},
    lineHeight = 600 - lineMargin.top - lineMargin.bottom;
    var lineWidth = 750 - lineMargin.left - lineMargin.right;

    const x = d3.scalePoint().range([0, lineWidth]);
    const y = d3.scaleLinear().range([lineHeight, 0]);

    const lineSvg = d3.select('#line-trend')
    .append('svg')
        .attr('id', 'line_svg')
        .attr('width', lineWidth + lineMargin.left + lineMargin.right)
        .attr('height', lineHeight + lineMargin.top + lineMargin.bottom)
    .append('g')
        .attr('transform', `translate(${lineMargin.left},${lineMargin.top})`);

    var current_button = "categories"

    // Create svg for pie chart
    const width = 350, height = 350, margin = 40;
    const radius = Math.min(width, height) / 2 - margin
    const arc = d3.arc().innerRadius(radius/2).outerRadius(radius);

    const svg = d3.select("#pie-trend")
    .append("svg")
        .attr("width", width)
        .attr("height", height)
    .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    // Add a tooltip div.
    const tooltip = d3.select("#pie-trend")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "black")
    .style("color", "white")
    .style("border-radius", "5px")
    .style("padding", "10px")

    const showTooltip = function(event, d) {
        d3.select(this)
            .style("stroke", "black")
            .style("stroke-width", "2px")
        tooltip
            .transition()
            .duration(100)
            .style("opacity", 1)
        if(d.data != undefined){
            tooltip.html(current_button + " " + d.data[0] + ": " + d.data[1])
        }
        else{
            tooltip.html(current_button + " " + d[0] + ": " + d[1])
        }
        
        tooltip
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY) + "px")
    }
    const moveTooltip = function(event) {
        tooltip
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY) - 50 + "px")
    }
    const hideTooltip = function() {
        d3.select(this)
            .style("stroke", "none")
        tooltip
            .transition()
            .duration(100)
            .style("opacity", 0)
    }

    const clickOnCircle = function() {
        d3.select(this)
            .style("stroke", "black")
            .style("stroke-width", "2px")
        
        fetchPieData().then(data => updatePie(data))
    }

    const fetchData = async (params = {}) => {
        let url = '/api/boardgames_trend';
        let queryParams = new URLSearchParams(params).toString();
        if (queryParams) {
            url += `?${queryParams}`;
        }
        const response = await fetch(url);
        return await response.json();
    };

    const fetchPieData = async (params = {}) => {
        let url = '/api/boardgames_pietrend';
        let queryParams = new URLSearchParams(params).toString();
        if (queryParams) {
            url += `?${queryParams}`;
        }
        const response = await fetch(url);
        return await response.json();
    };
    
    // document.querySelectorAll('.trendbtn').forEach(button => {
    //     button.addEventListener('click', () => {
    //         current_button = button.id
    //         fetchData(button.id).then(data => updateCharts(data));
    //     });
    // });

    const createCharts = (data) => {
        // set the color scale
        color.domain(Object.keys(data))

        // Create the initial line chart
        x.domain(data.map(item => item.year));
        y.domain([0, d3.max(data.map(item => item.avg))]);
        
        lineSvg.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0,${lineHeight})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
              .attr('transform', 'rotate(45)')
              .style('text-anchor', 'start');

        lineSvg.append('g')
            .attr('class', 'axis axis--y')
            .call(d3.axisLeft(y));

        // Add the lines and the dots
        lineSvg.append('g')
            .append("path")
                .datum(data)
                .attr("d", d3.line()
                .x(d => x(+d.year))
                .y(d => y(+d.avg))
                )
                .attr("stroke", "#69b3a2")
                .style("stroke-width", 3)
                .style("fill", "none")
        lineSvg.selectAll('circle')
            .data(data)
            .join('circle')
                .attr("cx", d => x(+d.year))
                .attr("cy", d => y(+d.avg))
                .attr("r", 6)
                .style("fill", "#69b3a2")
            .on("click", clickOnCircle)
    }
    
    const updateLine = (data) => {
        // set the color scale
        color.domain(Object.keys(data))

        // Update line Chart
        d3.select('#line-trend')
            .transition()
            .duration(1000)
            .attr('width', lineWidth + lineMargin.left + lineMargin.right)
        x.range([0, lineWidth]).domain(Object.keys(data));
        y.domain([0, d3.max(Object.values(data))]);

        const bars = lineSvg.selectAll('.bar').data(entities);        
        
        bars.exit().remove();
        
        bars.join('rect')
            .on("mouseover", showTooltip )
            .on("mousemove", moveTooltip )
            .on("mouseleave", hideTooltip )
            .merge(bars)
            .transition()
            .duration(1000)
            .attr('class', 'bar')
            .attr('x', d => x(d[0]))
            .attr('y', d => y(d[1]))
            .attr('width', x.bandwidth())
            .attr('height', d => lineHeight - y(d[1]))
            .attr('fill', d => color(d[0]));

        // Update axes
        lineSvg.select('.axis--x')
            .transition()
            .duration(1000)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('transform', 'rotate(45)')
            .style('text-anchor', 'start');

        lineSvg.select('.axis--y')
            .transition()
            .duration(1000)
            .call(d3.axisLeft(y));
    
    }

    const updatePie = (data) => {
        
        const pie = d3.pie().value(d=>d.avg)
        const data_ready = pie(Object.entries(data))
        const arcs = svg.selectAll('path').data(data_ready);

        arcs.transition()
            .duration(1000)
            .attrTween('d', function(d) {
                const interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return t => arc(interpolate(t));
            });

        arcs.enter()
            .append('path')
            .attr('fill', d => color(d.data[0]))
            .on("mouseover", showTooltip )
            .on("mousemove", moveTooltip )
            .on("mouseleave", hideTooltip )
            .each(function(d) { this._current = d; })
            .transition()
            .duration(1000)
            .attrTween('d', function(d) {
                const interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return t => arc(interpolate(t));
            });
            
        arcs.exit().remove();
    }

    fetchData().then(data => createCharts(data));
});
