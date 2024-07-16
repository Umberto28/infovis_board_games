// script that handles legend creation for graph visualization
const addLegend = (svg, nodes, colorScale, property) => {
    svg.selectAll('.legend').remove(); // clear existing legend

    const uniqueValues = [...new Set(nodes.map(node => node[property]))].sort((a, b) => a - b);
    // implement different sort when dealing with categories, mechanics and designers

    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', 'translate(20, 20)'); // adjust position here

    uniqueValues.forEach((value, i) => {
        const legendRow = legend.append('g')
            .attr('transform', `translate(0, ${i * 20})`) // adjust spacing here
            .on('click', () => {
                const isActive = legendRow.classed('active'); // used for toggling highlight of a certain year
                
                // toggle active state
                legendRow.classed('active', !isActive);

                svg.selectAll('circle').filter(d => d[property] === value)
                    .classed('highlighted', !isActive)
                    .attr('r', isActive ? 7 : 10)
                    .attr('stroke', isActive ? '#fff' : 'black');
            });

            // Mouse Hovering version
            //.on('mouseover', () => {
            //    svg.selectAll('circle').filter(d => d.year === year)
            //        .attr('r', 10) // enlarge nodes of highlighted year
            //        .attr('stroke', 'black');
            //})
            //.on('mouseout', () => {
            //    svg.selectAll('circle').filter(d => d.year === year)
            //        .attr('r', 7) // reset node size
            //        .attr('stroke', '#fff');
            //});

        legendRow.append('rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', colorScale(value));

        legendRow.append('text')
            .attr('x', 20)
            .attr('y', 10)
            .attr('text-anchor', 'start')
            .text(value);
    });
};