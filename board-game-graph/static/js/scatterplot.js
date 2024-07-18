d3.json('/data').then(function(data) {
    const reviewCounts = data.map(d => d.rating.num_of_reviews).sort((a, b) => b - a);
    const reviewRanks = data.map(d => reviewCounts.indexOf(d.rating.num_of_reviews) + 1);

    // calculate derived informations
    data.forEach(game => {
        game.avgplaytime = (game.minplaytime + game.maxplaytime) / 2;
        game.popularity_rank = reviewRanks[data.indexOf(game)];
    });

    const margin = { top: 20, right: 30, bottom: 40, left: 100 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#scatterplot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    let x = d3.scaleLinear()
        .domain([1, 100])
        .range([0, width]);

    let y = d3.scaleBand()
        .range([height, 0])
        .padding(0.1);

    let xAxis = svg.append("g")
        .attr("transform", `translate(0,${height})`);
    
    // let xAxis = d3.axisBottom(x);

    let yAxis = svg.append("g");

    // svg.append("g")
    //    .attr("transform", `translate(0,${height})`)
    //    .call(xAxis)
    //    .append("text")
    //    .attr("x", width)
    //    .attr("y", -10)
    //    .attr("fill", "black")
    //    .attr("text-anchor", "end")
    //    .text("Ranking");

    // Function to update the scatterplot
    function updateAxes(xParameter, yParameter) {
        // X-axis Handling
        x.domain([1, 100]);

        xAxis.transition().call(d3.axisBottom(x));

        // Y-axis Handling
        let distinct_y_values = Array.from(new Set(data.map(d => String(d[yParameter]))));
        distinct_y_values.sort((a, b) => a - b);

        // y.domain(d3.extent(data, d => d[parameter]));
        y.domain(distinct_y_values);

        yAxis.transition().call(d3.axisLeft(y));

        // data binding
        const circles = svg.selectAll("circle")
            .data(data, d => d.id);

        circles.enter().append("circle")
            .attr("cx", d => x(xParameter === 'popularity' ? d.popularity_rank : d.rank))
            .attr("cy", d => y(String(d[yParameter])) + y.bandwidth() / 2)
            .attr("r", 5)
            .style("fill", "steelblue")
            .merge(circles)
            .transition()
            // .attr("cx", d => x(d.rank))
            .attr("cx", d => x(xParameter === 'popularity' ? d.popularity_rank : d.rank))
            .attr("cy", d => y(String(d[yParameter])) + y.bandwidth() / 2);

        circles.exit().remove();
    }

    // default values
    updateAxes("rank", "year");

    // updates
    d3.select("#x-axis-select").on("change", function() {
        const xParameter = this.value;
        const yParameter = d3.select("#y-axis-select").node().value;
        updateAxes(xParameter, yParameter);
    });
    d3.select("#y-axis-select").on("change", function() {
        const xParameter = d3.select("#x-axis-select").node().value;
        const yParameter = this.value;
        updateAxes(xParameter, yParameter);
    });
});
