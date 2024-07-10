function applyLocalEdgeLens(svg, nodeSelection, linkSelection, width, height) {
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);

    svg.call(zoom);

    function zoomed(event) {
        const { transform } = event;
        svg.selectAll('g').attr("transform", transform);
        nodeSelection.attr("r", 5 / transform.k);

        updateEdgesVisibility(transform);
        showNodePopups(transform);
    }

    function updateEdgesVisibility(transform) {
        const visibleNodes = new Set();
        
        // Check which nodes are visible within the current zoom/pan view
        nodeSelection.each(function(d) {
            const [x, y] = transform.apply([d.x, d.y]);
            if (x >= 0 && x <= width && y >= 0 && y <= height) {
                visibleNodes.add(d.id);
            }
        });

        // Update link opacity with a transition
        linkSelection.transition()
            .duration(500) // Set the duration of the transition
            .style('stroke-opacity', d => 
                visibleNodes.has(d.source.id) && visibleNodes.has(d.target.id) ? 1 : 0.1
            );
    }

    function showNodePopups(transform) {
        const visibleNodes = [];

        // Collect visible nodes
        nodeSelection.each(function(d) {
            const [x, y] = transform.apply([d.x, d.y]);
            if (x >= 0 && x <= width && y >= 0 && y <= height) {
                visibleNodes.push({ ...d, x, y });
            }
        });

        // Remove existing popups
        d3.selectAll('.node-popup').remove();

        // If there are at most 15 visible nodes, show popups
        if (visibleNodes.length <= 15) {
            const popupContainer = svg.append('g').attr('class', 'node-popup-container');

            visibleNodes.forEach(node => {
                popupContainer.append('text')
                    .attr('class', 'node-popup')
                    .attr('x', node.x)
                    .attr('y', node.y - 10) // Position above the node
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '14px')
                    .attr('font-style', 'italic')
                    .attr('font-weight', 'bold')
                    .attr('fill', 'orange')
                    .text(node.name);
            });
        }
    }
}
