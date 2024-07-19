// Load data and create bubble chart
d3.json("/data").then(data => {
    // Set the dimensions and margins of the graph
    const margin = {top: 10, right: 30, bottom: 50, left: 60},
          width = 800 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;

    // Append the svg object to the body of the page
    const svg = d3.select("#bubblechart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select("#tooltip");
    const card = d3.select("#card");

    // Compute the average players and prepare the data
    const processedData = d3.rollups(data, v => {
        return {
            avgPlayers: Math.round(d3.mean(v, d => (d.minplayers + d.maxplayers) / 2)),
            avgRanking: d3.mean(v, d => d.rank),
            games: v.map(d => ({ name: d.title, rank: d.rank }))
        };
    }, d => d.year, d => Math.round((d.minplayers + d.maxplayers) / 2)).map(([year, values]) => {
        return values.map(([avgPlayers, metrics]) => ({
            year: year,
            avgPlayers: avgPlayers,
            avgRanking: metrics.avgRanking,
            games: metrics.games
        }));
    }).flat();

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

    // Function to create the bubble chart
    function createBubbleChart(filteredData) {
        svg.selectAll("*").remove();

        // Add X axis
        const x = d3.scaleLinear()
            .domain([d3.min(filteredData, d => d.year), d3.max(filteredData, d => d.year)])
            .range([0, width]);
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([d3.min(filteredData, d => d.avgPlayers) - 1, d3.max(filteredData, d => d.avgPlayers) + 1])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Add a scale for bubble size (correct for ranking)
        const z = d3.scaleLinear()
            .domain(d3.extent(filteredData, d => d.avgRanking).reverse())
            .range([4, 40]);

        // Add a color scale for ranking
        const color = d3.scaleSequential(d3.interpolateRdYlBu)
            .domain([100, 1]);  // Rank 1 will be red, Rank 100 will be blue

        // Add bubbles
        svg.append("g")
            .selectAll("circle")
            .data(filteredData)
            .enter()
            .append("circle")
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.avgPlayers))
            .attr("r", d => z(d.avgRanking))
            .style("fill", d => color(d.avgRanking))
            .style("opacity", "0.7")
            .attr("stroke", "black")
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Ranking: ${d.avgRanking.toFixed(2)}`)
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
                        <h4>Games from ${d.year} with ${d.avgPlayers} players</h4>
                        <ul>
                            ${d.games.map(game => `<li>${game.name} (Rank: ${game.rank})</li>`).join('')}
                        </ul>
                    `);
            });

        // Hide the card when clicking outside
        d3.select("body").on("click", function(event) {
            if (!event.target.closest("circle")) {
                card.style("display", "none");
            }
        });
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
