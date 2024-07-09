document.addEventListener('DOMContentLoaded', function() {
    const width = document.getElementById('graph').clientWidth;
    const height = document.getElementById('graph').clientHeight;

    const svg = d3.select('#graph').append('svg')
        .attr('width', width)
        .attr('height', height);

    const tooltip = d3.select('#tooltip');
    const card = d3.select('#card');

    d3.json('/data').then(data => {
        const nodes = data.map(game => ({ id: game.id, name: game.name }));
        const links = [];
        data.forEach(game => {
            game.peopleAlsoLike.forEach(like => {
                links.push({ source: game.id, target: like });
            });
        });

        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id))
            .force('charge', d3.forceManyBody().strength(-200))
            .force('center', d3.forceCenter(width / 2, height / 2));

        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6);

        const node = svg.append('g')
            .selectAll('circle')
            .data(nodes)
            .enter().append('circle')
            .attr('r', 5)
            .attr('fill', '#69b3a2')
            .call(drag(simulation));

        node.on('mouseover', (event, d) => {
            tooltip.classed('hidden', false)
                .html(d.name)
                .style('left', (event.pageX + 5) + 'px')
                .style('top', (event.pageY + 5) + 'px');
        }).on('mouseout', () => {
            tooltip.classed('hidden', true);
        }).on('click', (event, d) => {
            const game = data.find(game => game.id === d.id);
            card.classed('hidden', false)
                .html(`<h3>${game.name}</h3><p>${game.description}</p>`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY + 10) + 'px');
        });

        simulation.on('tick', () => {
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
    });
});
