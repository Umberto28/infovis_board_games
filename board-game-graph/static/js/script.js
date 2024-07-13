document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    const width = document.getElementById('graph').clientWidth;
    const height = document.getElementById('graph').clientHeight;
    
    // const width = window.innerWidth;
    // const height = window.innerHeight;

    console.log('Graph dimensions:', width, height);

    const svg = d3.select('#graph').append('svg')
        .attr('width', width)
        .attr('height', height);

    console.log('SVG created');

    const tooltip = d3.select('#tooltip');
    const card = d3.select('#card');

    d3.json('/data').then(data => {
        console.log('Data loaded:', data);

        const nodes = data.map(game => ({ id: game.id, name: game.title }));
        console.log('Nodes:', nodes.length);

        const nodeIds = new Set(nodes.map(node => node.id));

        const links = [];
        data.forEach(game => {
            game.recommendations.fans_liked.forEach(like => {
                if (nodeIds.has(like)) {
                    links.push({ source: game.id, target: like });
                } else {
                    console.warn(`Node not found: ${like}`);
                }
            });
        });
        console.log('Links:', links.length);

        const datasetByYear = data.map(game => {
            return {
              id: game.id,
              title: game.title,
              year: game.year
            };
          });
          console.log(datasetByYear);

        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(60).strength(0.05))
            .force('charge', d3.forceManyBody().strength(-200))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collide', d3.forceCollide().radius(23).strength(0.6));

        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .enter()
            .append('line')
                .attr('stroke', '#000')
                .attr('stroke-opacity', 0.16);

        const node = svg.append('g')
            .selectAll('circle')
            .data(nodes)
            .enter()
            .append('circle')
                .attr('r', 7)
                .attr('fill', '#CC0000')
                .attr('stroke', '#000')
            .call(drag(simulation));

        node.on('mouseover', (event, d) => {
            tooltip.classed('hidden', false)
                .html(d.name)
                .style('left', (event.pageX + 5) + 'px')
                .style('top', (event.pageY + 5) + 'px');
        }).on('mouseout', () => {
            tooltip.classed('hidden', true);
        }).on('click', (event, d) => {
            event.stopPropagation();
            const game = data.find(game => game.id === d.id);
            card.classed('hidden', false)
                .html(`<h3>${game.title}</h3><p>${game.year}</p>`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY + 10) + 'px');
            console.log('Card shown:', game);
        });

        simulation.on('tick', () => {
            nodes.forEach(d => {
                d.x = Math.max(10, Math.min(width - 10, d.x));
                d.y = Math.max(10, Math.min(height - 10, d.y));
            });

            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
        });

        function drag(simulation) {
            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }

            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }

            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }

            return d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended);
        }

        // Apply Local Edge Lens
        applyLocalEdgeLens(svg, node, link, width, height);
    });
    
    document.addEventListener('click', () => {
        card.classed('hidden', true);
        console.log('Card hidden');
    });

    // Prevent card from hiding when clicking on the card itself
    card.on('click', (event) => {
        event.stopPropagation();
    });
});
