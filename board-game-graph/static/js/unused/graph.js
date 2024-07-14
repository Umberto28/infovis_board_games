function updateGraph(data) {
    const width = document.getElementById('graph').clientWidth;
    const height = document.getElementById('graph').clientHeight;

    const svg = d3.select('#graph').select('svg');

    svg.selectAll("*").remove();

    const nodes = data.map(game => ({ id: game.id, name: game.title }));

    const nodeIds = new Set(nodes.map(node => node.id));

    const links = [];
    data.forEach(game => {
        game.recommendations.fans_liked.forEach(like => {
            if (nodeIds.has(like)) {
                links.push({ source: game.id, target: like });
            }
        });
    });

    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(60).strength(0.05))
        .force('charge', d3.forceManyBody().strength(-100))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collide', d3.forceCollide().radius(23).strength(0.6));

    const link = svg.append('g')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
            .attr('stroke', '#636363')
            .attr('stroke-opacity', 0.16);

    const node = svg.append('g')
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
            .attr('r', 7)
            .attr('fill', '#a30202')
            .attr('stroke', '#660101')
        .call(drag(simulation));

    node.on('mouseover', (event, d) => {
        tooltip.classed('hidden', false)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY + 10) + 'px')
            .html(d.name);
    });

    node.on('mouseout', () => {
        tooltip.classed('hidden', true);
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

    node.on('click', (event, d) => {
        const game = data.find(game => game.id === d.id);
        card.classed('hidden', false);
        card.html(`
            <h2>${game.title}</h2>
            <p><strong>Year:</strong> ${game.year}</p>
            <p><strong>Min Players:</strong> ${game.minplayers}</p>
            <p><strong>Max Players:</strong> ${game.maxplayers}</p>
            <p><strong>Play Time:</strong> ${game.minplaytime} - ${game.maxplaytime} mins</p>
            <p><strong>Age:</strong> ${game.minage}+</p>
            <p><strong>Categories:</strong> ${game.types.categories.map(c => c.name).join(', ')}</p>
            <p><strong>Mechanics:</strong> ${game.types.mechanics.map(m => m.name).join(', ')}</p>
            <p><strong>Designer:</strong> ${game.credit.designer.map(d => d.name).join(', ')}</p>
        `);
    });
}

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