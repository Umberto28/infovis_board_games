function applyLocalEdgeLens(svg, nodeSelection, linkSelection, width, height) {
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);

    svg.call(zoom);

    function zoomed(event) {
        const { transform } = event;
        // Enable panning only if zoom level is greater than 1
        if (transform.k > 1) {
            svg.selectAll('g').attr("transform", transform);
            nodeSelection.attr("r", 7 / transform.k + 1);
            updateEdgesVisibility(transform);
            showNodePopups(transform);
        } else {
            svg.selectAll('g').attr("transform", null);
            nodeSelection.attr("r", 7);
            updateEdgesVisibility(transform);
            showNodePopups(transform);
        }
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
            .style('stroke-opacity', d => {
                if (visibleNodes.has(d.source.id) && visibleNodes.has(d.target.id) && transform.k > 3) {
                    // If both source and target nodes are visible, set opacity to 1
                    return 0.6;
                } else if (transform.k > 3) {
                    // If zoom is applied and nodes are not visible, set opacity to 0.1
                    return 0.01;
                } else {
                    // If no zoom is applied, set opacity to 0.05
                    return 0.16;
                }
            });
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

        // Show popups if there are at most 15 visible nodes and zoom is applied
        if (visibleNodes.length <= 15 && transform.k > 3) {
            const popupContainer = svg.append('g').attr('class', 'node-popup-container');

            visibleNodes.forEach(node => {
                popupContainer.append('text')
                    .attr('class', 'node-popup')
                    .attr('x', node.x)
                    .attr('y', node.y - 25) // Position above the node
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '18px')
                    .attr('fill', '#a30202')
                    .attr('stroke', '#FFF')
                    .attr('stroke-width', '0.2px')
                    .attr('font-style', 'italic')
                    .attr('font-weight', 'bold')
                    .text(node.name);
            });
        }
    }
}