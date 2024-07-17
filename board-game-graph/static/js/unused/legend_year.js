// script that handles legend creation for graph visualization
const addLegend = (svg, nodes, colorScale) => {
    svg.selectAll('.legend').remove(); // clear existing legend
    const years = [...new Set(nodes.map(node => node.year))].sort((a, b) => a - b);

    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', 'translate(20, 20)'); // adjust position here

    years.forEach((year, i) => {
        const legendRow = legend.append('g')
            .attr('transform', `translate(0, ${i * 20})`) // adjust spacing here
            .on('click', () => {
                const isActive = legendRow.classed('active'); // used for toggling highlight of a certain year
                
                // when already active, it this defaults it back to inactive
                legendRow.classed('active', false);
                svg.selectAll('circle').filter(d => d.year === year).classed('highlighted', false).attr('r', 7).attr('stroke', '#fff'); // reset node

                // if inactive, then make it active when clicking
                if (!isActive) {
                    legendRow.classed('active', true);
                    svg.selectAll('circle').filter(d => d.year === year)
                    .classed('highlighted', true)
                    .attr('r', 10)
                    .attr('stroke', 'black');
                }
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
            .attr('fill', colorScale(year));

        legendRow.append('text')
            .attr('x', 20)
            .attr('y', 10)
            .attr('text-anchor', 'start')
            .text(year);
    });
};