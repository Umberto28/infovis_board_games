d3.json("/data").then(data => {
    // Set the dimensions and margins of the graph
    const margin = {top: 30, right: 200, bottom: 100, left: 100},
          width = 1200 - margin.left - margin.right,  // Increased width
          height = 800 - margin.top - margin.bottom;  // Increased height

    // Append the svg object to the body of the page
    const svg = d3.select("#bubblechart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select("#tooltip")
        .style("opacity", 0);
    const card = d3.select("#card")
        .style("display", "none");

    // Compute the average players and prepare the data
    const processedData = d3.rollups(data, v => {
        return {
            avgPlayers: d3.mean(v, d => (d.minplayers + d.maxplayers) / 2),
            avgRanking: d3.mean(v, d => d.rank),
            games: v.map(d => ({ name: d.title, rank: d.rank, minplayers: d.minplayers, maxplayers: d.maxplayers })),
        };
    }, d => d.year, d => (d.minplayers + d.maxplayers) / 2).map(([year, values]) => {
        return values.map(([avgPlayers, metrics]) => ({
            year: year,
            avgPlayers: avgPlayers,
            avgRanking: metrics.avgRanking,
            games: metrics.games,
            numGames: metrics.games.length
        }));
    }).flat();

    function float2int (value) {
        return value | 0;
    }

    // Extract unique years from the dataset
    const uniqueYears = [...new Set(processedData.map(d => d.year))].sort((a, b) => a - b);

    // Set slider attributes based on unique years
    const minYearSlider = document.getElementById("min-year");
    const maxYearSlider = document.getElementById("max-year");
    const minYearValue = document.getElementById("min-year-value");
    const maxYearValue = document.getElementById("max-year-value");

    minYearSlider.min = 0;
    minYearSlider.max = uniqueYears.length - 1;
    minYearSlider.value = 0;
    minYearValue.textContent = uniqueYears[0];

    maxYearSlider.min = 0;
    maxYearSlider.max = uniqueYears.length - 1;
    maxYearSlider.value = uniqueYears.length - 1;
    maxYearValue.textContent = uniqueYears[uniqueYears.length - 1];

    function createBubbleChart(filteredData) {
        svg.selectAll("*").remove();

        // Add X axis
        const x = d3.scaleLinear()
            .domain([d3.min(filteredData, d => d.year), d3.max(filteredData, d => d.year)])
            .range([0, width]);
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        // X axis label
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + margin.top + 20)
            .text("Release Year");

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, 6]) // Y axis from 0 to 6 // Avg players on the y-axis
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Y axis label
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 60)
            .attr("x", -margin.top)
            .text("Average Number of Players");

        // Add a scale for bubble size based on number of games
        const z = d3.scaleLinear()
            .domain(d3.extent(filteredData, d => d.numGames))
            .range([4, 60]); // Adjusted to make size differences more pronounced

        // Add a color scale for ranking
        const color = d3.scaleSequential(d3.interpolateRdYlBu)
            .domain([5, 100]);  // Rank 1 will be red, Rank 100 will be blue

        // Add bubbles with transitions
        const bubbles = svg.append("g")
            .selectAll("circle")
            .data(filteredData);

        bubbles.enter()
            .append("circle")
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.avgPlayers))  // Y coordinate based on avgPlayers
            .attr("r", 0) // Start with radius 0
            .style("fill", d => color(d.avgRanking))
            .style("opacity", "0.7")
            .attr("stroke", "black")
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Year: ${d.year}<br>Average Ranking: ${float2int(d.avgRanking.toFixed(2))}<br>Number of Board Games in this group: ${d.numGames}<br>Average Number of players: ${d.avgPlayers}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", function(event, d) {
                card.style("display", "block")
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY + 5) + "px")
                    .html(`
                        <h4>Games from ${d.year} with ${d.avgPlayers} average number of players</h4>
                        <ul>
                            ${d.games.map(game => `<li>${game.name} (Rank: ${game.rank}), (Players: ${game.minplayers}-${game.maxplayers})</li>`).join('')}
                        </ul>
                    `);
            })
            .transition()
            .duration(1000)
            .attr("r", d => z(d.numGames)); // Animate to final radius

        bubbles.transition()
            .duration(1000)
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.avgPlayers))  // Y coordinate based on avgPlayers
            .attr("r", d => z(d.numGames));

        bubbles.exit()
            .transition()
            .duration(1000)
            .attr("r", 0)
            .remove();

        // Hide the card when clicking outside
        d3.select("body").on("click", function(event) {
            if (!event.target.closest("circle")) {
                card.style("display", "none");
            }
        });
            
        // Add legend for color
        const legendColor = svg.append("g")
            .attr("transform", `translate(${-margin.left + 5},${height / 2 + 200})`);
    
        legendColor.append("text")
            .attr("x", 0)
            .attr("y", -20)
            .text("Ranking")
            .style("font-size", "14px")
            .attr("alignment-baseline", "middle");
    
        const colorValues = [5, 50, 100];
    
        legendColor.selectAll("rect")
            .data(colorValues)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 20)
            .attr("width", 20)
             .attr("height", 20)
            .style("fill", d => color(d));
    
        legendColor.selectAll("text.color")
            .data(colorValues)
            .enter()
            .append("text")
            .attr("x", 30)
            .attr("y", (d, i) => 10 + i * 20)
            .text(d => d)
            .style("font-size", "12px")
            .attr("alignment-baseline", "middle");
    
    }

    // Initial display
    createBubbleChart(processedData);

    // Update chart based on selected year range
    function updateChart() {
        const minYear = uniqueYears[minYearSlider.value];
        const maxYear = uniqueYears[maxYearSlider.value];
        minYearValue.textContent = minYear;
        maxYearValue.textContent = maxYear;

        const filteredData = processedData.filter(d => d.year >= minYear && d.year <= maxYear);
        createBubbleChart(filteredData);
    }

    minYearSlider.addEventListener("input", updateChart);
    maxYearSlider.addEventListener("input", updateChart);

    // Initial values for slider displays
    minYearValue.textContent = uniqueYears[minYearSlider.value];
    maxYearValue.textContent = uniqueYears[maxYearSlider.value];
});
