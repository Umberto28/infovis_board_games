// script that handles legend creation for graph visualization
const addLegend = (svg, nodes, colorScale, property) => {
    // svg.selectAll('.legend').remove(); // clear existing legend inside graph

    const legendContainer = d3.select('#legend-container');

    legendContainer.selectAll('*').remove();

    const uniqueValues = [...new Set(nodes.map(node => node[property]))].sort((a, b) => a - b);
    // implement different sort in the future when dealing with categories, mechanics and designers

    // const legend = svg.append('g')
    const legend = legendContainer.append('div')
        .attr('class', 'legend');
        // .attr('transform', 'translate(20, 20)'); // adjust position here

    uniqueValues.forEach((value, i) => {
        const legendRow = legend.append('div')
            .attr('class', 'legend-row')
            // .attr('transform', `translate(0, ${i * 20})`) // adjust spacing here
            .on('click', () => {
                const isActive = legendRow.classed('active'); // used for toggling highlight of a certain year
                
                // toggle active state
                legendRow.classed('active', !isActive);

                svg.selectAll('circle').filter(d => d[property] === value)
                    .classed('highlighted', !isActive)
                    // .attr('r', isActive ? 7 : 10) // commented for now as it causes bugs when zooming
                    .attr('stroke', isActive ? '#fff' : 'black');
            })

            .on('mouseover', () => {
                svg.selectAll('circle').filter(d => d[property] === value)
                    // .attr('r', 10) // enlarge nodes of highlighted year
                    .attr('stroke', 'black');
            })
            .on('mouseout', () => {
                const isActive = legendRow.classed('active');
                svg.selectAll('circle').filter(d => d[property] === value)
                    // .attr('r', 7) // reset node size
                    .attr('stroke', isActive ? 'black' : '#fff');
            });

        // legendRow.append('rect')
        legendRow.append('div')
            .attr('class', 'legend-row-color')
            // .attr('width', 10)
            // .attr('height', 10)
            .style('width', '10px')
            .style('height', '10px')
            // .attr('fill', colorScale(value));
            .style('background-color', colorScale(value));

        // legendRow.append('text')
        legendRow.append('div')
            .attr('class', 'legend-row-text')
            // .attr('x', 20)
            // .attr('y', 10)
            // .attr('text-anchor', 'start')
            .text(value);
    });
};