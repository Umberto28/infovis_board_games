d3.json('/data').then(function(data) {
    const color = d3.scaleOrdinal().range(['#85edc3', '#e6a766', '#5288e4', '#e09793', '#af91df', '#dab974', '#53d55a', '#97f1a3', '#a7e290', '#e4d14f', '#e99561', '#3be8a7', '#9ae6b8', '#e6255c', '#d38664', '#7fdeed', '#b0dd9a', '#7097d3', '#4ac8d4', '#e9bcac', '#df9daa', '#e48e9c', '#948ce2', '#a5eedc', '#de938a', '#e04da1', '#dcca85', '#edd7a0', '#d2789f', '#c4ef9b', '#6fbae1', '#eae655', '#2edc3d', '#51c2e1', '#d14ca9', '#dd8470', '#c2ea4f', '#e05789', '#e3b96f', '#bb5ae8', '#475bc5', '#94ebc4', '#d264dc', '#3a33de', '#8972da', '#70e7e2', '#91e2d9', '#a4b3ef', '#cfee9d', '#e03e64', '#b29add', '#c691e6', '#93d77c', '#6a6fe4', '#e04c58', '#48b3d9', '#cd66c3', '#d151e9', '#e285b3', '#dc8eb8', '#9f62d1', '#5ace7c', '#dc67ea', '#dd2873', '#d8e4a1', '#79b4e9', '#abd059', '#59b1d6', '#f1a5e4', '#b537e8', '#a7e772', '#d9d16f', '#a9ebd9', '#cad581', '#c57a41', '#995cd5', '#d1d935', '#6bd762', '#3c4dd0', '#94eff0', '#e4e489', '#e063de', '#8887d9', '#aae6be', '#89d98a', '#69e8e0', '#de74e1', '#9ce192', '#87d798', '#a77ce2', '#cb79e5', '#3660e1', '#c6e48a', '#a6c2e4', '#e29771', '#9b8be8', '#72edac', '#b5ea90', '#77e563', '#50e6b5', '#e367c4', '#e6ce4c', '#59a2d8', '#ed8dd8', '#ad92ec', '#442cd4', '#9e46dd', '#e88c7e', '#c6944c', '#5bde92', '#ec5eb6', '#ddef99', '#cae5ab', '#81d5c4', '#436ec9', '#e19cde', '#e88b8b', '#7db1e6', '#e99f60', '#e26b6e', '#97e184', '#39dc64', '#48b0c5'])

    const reviewCounts = data.map(d => d.rating.num_of_reviews).sort((a, b) => b - a);
    const reviewRanks = data.map(d => reviewCounts.indexOf(d.rating.num_of_reviews) + 1);

    // calculate derived informations
    data.forEach(game => {
        game.avgplaytime = (game.minplaytime + game.maxplaytime) / 2;
        game.popularity_rank = reviewRanks[data.indexOf(game)];
    });

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const barMargin = { top: 20, right: 5, bottom: 40, left: 10 };
    const barWidth = 150;

    const svg = d3.select("#scatterplot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const barSvg = d3.select("#distribution").append("svg")
        .attr("width", barWidth + barMargin.left + barMargin.right)
        .attr("height", height + barMargin.top + barMargin.bottom)
        .append("g")
        .attr("transform", `translate(${barMargin.left},${barMargin.top})`);

    let x = d3.scaleLinear().range([0, width]);
    let y = d3.scaleBand().range([height, 0]).padding(0.1);

    let x_axis = svg.append("g").attr("transform", `translate(0,${height})`);
    let y_axis = svg.append("g");

    let barX = d3.scaleLinear().range([barWidth, 0]);
    let barY = d3.scaleBand().range([height, 0]).padding(0.1);

    let barXAxis = barSvg.append("g").attr("transform", `translate(0,${height})`);
    let barYAxis = barSvg.append("g").attr("transform", `translate(${barWidth},0)`);

    // function to calculate linear regression line which shows trend of the scatterplot
    function linearRegression(data, xAccessor, yAccessor) {
        const xValues = data.map(xAccessor);
        const yValues = data.map(yAccessor);
    
        const xMean = d3.mean(xValues);
        const yMean = d3.mean(yValues);
    
        const numerator = d3.sum(data, d => (xAccessor(d) - xMean) * (yAccessor(d) - yMean));
        const denominator = d3.sum(data, d => Math.pow(xAccessor(d) - xMean, 2));
    
        const slope = numerator / denominator;
        const intercept = yMean - slope * xMean;
    
        return { slope, intercept };
    }

    // update scatterplot and bar chart
    function updateAxes(x_parameter, y_parameter) {
        const xDomain = x_parameter === 'popularity' ? [1, d3.max(data, d => d.popularity_rank)] : [1, d3.max(data, d => d.rank)];
        x.domain(xDomain);
        x_axis.transition().call(d3.axisBottom(x));

        let distinct_y_values = Array.from(new Set(data.map(d => String(d[y_parameter]))));
        distinct_y_values.sort((a, b) => a - b);
        y.domain(distinct_y_values);
        y_axis.transition().call(d3.axisLeft(y));

        // added so it also updates the colors when changing parameters
        const colorScale = d3.scaleOrdinal()
            .domain(distinct_y_values)
            .range(color.range());

        ////////////////////////
        //  trend line update //
        ////////////////////////
        const regression = linearRegression(
            data,
            d => x_parameter === 'popularity' ? d.popularity_rank : d.rank,
            d => distinct_y_values.indexOf(String(d[y_parameter]))
        );
        
        const trendLine = d3.line()
            .x(d => x(d.x))
            .y(d => y(d.y));
    
        const xExtent = [d3.min(data, d => x_parameter === 'popularity' ? d.popularity_rank : d.rank),
                         d3.max(data, d => x_parameter === 'popularity' ? d.popularity_rank : d.rank)];
        
        const yExtent = distinct_y_values;
    
        const trendData = [
            { x: xExtent[0], y: regression.slope * xExtent[0] + regression.intercept },
            { x: xExtent[1], y: regression.slope * xExtent[1] + regression.intercept }
        ];
    
        // to ensure y values are in valid range
        trendData.forEach(d => {
            d.y = yExtent[Math.round(d.y)] || yExtent[0];
        });
    
        svg.selectAll(".trend-line").remove(); // to remove existing trend line
    
        svg.append("path")
            .datum(trendData)
            .attr("class", "trend-line")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "5,5") // Add dashed line style
            .attr("d", trendLine);

        ////////////////////////
        // scatterplot update //
        ////////////////////////
        const circles = svg.selectAll("circle")
            .data(data, d => d.id);

        circles.enter().append("circle")
            .attr("cx", d => x(x_parameter === 'popularity' ? d.popularity_rank : d.rank))
            .attr("cy", d => y(String(d[y_parameter])) + y.bandwidth() / 2)
            .attr("r", 5)
            .attr("fill", d => colorScale(String(d[y_parameter])))
            .merge(circles)
            .transition()
            // .attr("cx", d => x(d.rank))
            .attr("cx", d => x(x_parameter === 'popularity' ? d.popularity_rank : d.rank))
            .attr("cy", d => y(String(d[y_parameter])) + y.bandwidth() / 2)
            .attr("fill", d => colorScale(String(d[y_parameter])));

        circles.exit().remove();

        ////////////////////////
        //  bar chart update  //
        ////////////////////////
        const distributionData = d3.rollup(data, v => v.length, d => String(d[y_parameter]));
        const barData = Array.from(distributionData, ([key, value]) => ({ key, value }));

        barX.domain([0, d3.max(barData, d => d.value)]);
        barY.domain(distinct_y_values);

        const bars = barSvg.selectAll("rect")
            .data(barData, d => d.key);

        bars.enter().append("rect")
            .attr("x", d => barX(d.value))
            .attr("y", d => barY(d.key))
            .attr("width", d => barWidth - barX(d.value))
            .attr("height", barY.bandwidth())
            .attr("fill", d => colorScale(String(d.key)))
            .merge(bars)
            .transition()
            .attr("x", d => barX(d.value))
            .attr("y", d => barY(d.key))
            .attr("width", d => barWidth - barX(d.value))
            .attr("height", barY.bandwidth())
            .attr("fill", d => colorScale(String(d.key)));

        bars.exit().remove();

        barXAxis.transition().call(d3.axisBottom(barX).ticks(5));
        barYAxis.transition().call(d3.axisRight(barY).tickSize(0).tickFormat(''));
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
}).catch(function(error) {
    console.error('Error fetching data:', error);
});
