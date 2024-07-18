d3.json('/data').then(function(data) {
    // calculate average playtime
    data.forEach(game => {
        game.average_playtime = (game.minplaytime + game.maxplaytime) / 2;
    });

    // Set up SVG dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 50 },
            width = 800 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

    // Create SVG canvas
    const svg = d3.select("#scatterplot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define scales
    const x = d3.scaleLinear()
        .domain([1, d3.max(data, d => d.rank)])  // Rank 1 should be on the left
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.average_playtime)])
        .range([height, 0]);

    // Define axes
    const xAxis = d3.axisBottom(x).tickSize(-height).tickPadding(10);
    const yAxis = d3.axisLeft(y).tickSize(-width).tickPadding(10);

    // Add x-axis to the SVG
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Ranking");

    // Add y-axis to the SVG
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Average Playtime (minutes)");

    // Add scatterplot points
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 5)
        .attr("cx", d => x(d.rank))
        .attr("cy", d => y(d.average_playtime))
        .style("fill", "steelblue")
        .append("title")
        .text(d => `${d.title}: ${d.rank}`);
    });
