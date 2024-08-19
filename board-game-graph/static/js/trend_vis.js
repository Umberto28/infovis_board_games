document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    const bodyHeight = document.body.clientHeight,
    bodyWidth = document.body.clientWidth,
    percHeight = 0.522,
    percLineWidth = 0.354,
    percPieWidth = 0.25

    const absHeight = percHeight * bodyHeight,
    absLineWidth = percLineWidth * bodyWidth,
    absPieWidth = percPieWidth * bodyWidth

    // Color palette for charts
    const color = d3.scaleOrdinal().range(['#6daede', '#ee9aa1', '#b599e3', '#3cb8c4', '#d89d6a', '#98de5e', '#e3e47f', '#eaa9d1', '#b369d0', '#ab9ee6', '#eccf94', '#e181c8', '#c8e753', '#44c0d9', '#d7c546', '#e86b85', '#64e1dc', '#d6633b', '#54e540', '#a5e6c8', '#a6e132', '#76e98f', '#71e972', '#b9e8a2', '#ebdb9e', '#afade6', '#bdd13a', '#92c7de', '#d79c7e', '#dd9595', '#f0a1b8', '#eb8d7f', '#d469de', '#aaedbd', '#cb99f0', '#484dd6', '#ec7db9', '#b5eaa3', '#8fe497', '#667ae4', '#c961dd', '#50d0b0', '#886acd', '#60e799', '#bb90e5', '#e6abe3', '#cc487f', '#6696e8', '#9de7cb', '#6eabe9'])

    // Create svg for line chart
    const lineMargin = {top: 30, right: 30, bottom: 30, left: 40},
    lineHeight = absHeight - lineMargin.top - lineMargin.bottom,
    lineWidth = absLineWidth - lineMargin.left - lineMargin.right;

    const x = d3.scalePoint().range([0, lineWidth]);
    const y = d3.scaleLinear().range([lineHeight, 0]);

    const lineSvg = d3.select('#line-trend')
    .append('svg')
        .attr('id', 'line_svg')
        .attr('width', absLineWidth)
        .attr('height', absHeight)
    .append('g')
        .attr('transform', `translate(${lineMargin.left},${lineMargin.top})`);

    var current_button = "categories"
    var current_sel = "n_reviews"

    // Create svg for pie chart
    const  margin = 60;
    const radius = Math.min(absPieWidth, absHeight) / 2 - margin
    const arc = d3.arc().innerRadius(radius/2).outerRadius(radius);

    const pieSvg = d3.select("#pie-trend")
    .append("svg")
        .attr("width", absPieWidth)
        .attr("height", absHeight)
    .append("g")
        .attr("transform", `translate(${absPieWidth / 2},${absHeight / 2})`);

    // Add a tooltip div.
    const tooltip = d3.select("body")
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
            tooltip.html(d.data[0] + ": " + d.data[1] + ' (' + current_sel + ')')
        }
        else{
            tooltip.html(d[0] + ": " + d[1] + ' (' + current_sel + ')')
        }

        console.log(event.pageX)
        console.log(event.pageY)
        
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

    const clickOnCircle = function(event, d) {
        lineSvg.selectAll('circle')
            .style("stroke", "None")

        d3.select(this)
            .style("stroke", "black")
            .style("stroke-width", "2px")
        
        fetchPieData({year: d.year, attr: current_button}).then(data => updatePie(data, d.year))
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
        y.domain([0, d3.max(data.map(item => item.n_reviews))]);
        
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
                .y(d => y(+d.n_reviews))
                )
                .attr("stroke", "#69b3a2")
                .style("stroke-width", 3)
                .style("fill", "none")
        lineSvg.selectAll('circle')
            .data(data)
            .join('circle')
                .attr("cx", d => x(+d.year))
                .attr("cy", d => y(+d.n_reviews))
                .attr("r", 8)
                .style("fill", "#69b3a2")
            .on("click", clickOnCircle)
        
        pieSvg.append("text")
            .attr("id", "main_text_pie")
            .attr("class", "center-text")
            .attr("dominant-baseline", "middle")
            .attr("x", 0)
            .attr("y", -10)
            .text("");
        pieSvg.append("text")
            .attr("id", "sec_text_pie")
            .attr("class", "center-text")
            .attr("x", 0)
            .attr("y", 20)
            .text("");
    }
    
    const updateLine = (data) => {

        line
          .datum(data)
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(function(d) { return x(+d.year) })
            .y(function(d) { return y(+d.rating) })
          )
        dot
        .data(data)
        .transition()
        .duration(1000)
            .attr("cx", function(d) { return x(+d.year) })
            .attr("cy", function(d) { return y(+d.rating) })
    
    }

    const updatePie = (data, year) => {
        var data_to_use = data.ratings
        
        if (current_sel == 'n_reviews') {
            data_to_use = data.n_rev
        }
        
        // set the color scale
        color.domain(Object.keys(data_to_use))

        const pie = d3.pie().value(d=>d[1])
        const data_ready = pie(Object.entries(data_to_use))
        const arcs = pieSvg.selectAll('path').data(data_ready);

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
            .on("mouseover", showTooltip)
            .on("mousemove", moveTooltip)
            .on("mouseleave", hideTooltip)
            .each(function(d) { this._current = d; })
            .transition()
            .duration(1000)
            .attrTween('d', function(d) {
                const interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return t => arc(interpolate(t));
            });
            
        arcs.exit().remove();

        d3.select("#main_text_pie")
            .text(year)
            
        d3.select("#sec_text_pie")
            .text("tot: " + Object.keys(data_to_use).length);
    }

    fetchData().then(data => createCharts(data));
});
