document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    const width = document.getElementById('graph').clientWidth;
    const height = document.getElementById('graph').clientHeight;

    console.log('Graph dimensions:', width, height);

    const svg = d3.select('#graph').append('svg')
        .attr('width', width + 100)
        .attr('height', height + 100);

    console.log('SVG created');

    const tooltip = d3.select('#tooltip');
    const card = d3.select('#card');

    const fetchData = (year, minplayers, maxplayers, minplaytime, maxplaytime, minage) => {
        let url = '/api/boardgames';
        let params = [];
        if (year) {
            params.push(`year=${year}`);
        }
        if (minplayers) {
            params.push(`minplayers=${minplayers}`);
        }
        if (maxplayers) {
            params.push(`maxplayers=${maxplayers}`);
        }
        if (minplaytime) {
            params.push(`minplaytime=${minplaytime}`);
        }
        if (maxplaytime) {
            params.push(`maxplaytime=${maxplaytime}`);
        }
        if (minage) {
            params.push(`minage=${minage}`);
        }
        if (params.length > 0) {
            url += `?${params.join('&')}`;
        }
        return fetch(url)
            .then(response => response.json());
    };

    const updateGraph = (data) => {
        svg.selectAll("*").remove();

        console.log('Data loaded:', data);

        const nodes = data.map(game => ({ id: game.id, name: game.title }));
        console.log('Nodes:', nodes);

        const nodeIds = new Set(nodes.map(node => node.id));

        const links = [];
        data.forEach(game => {
            game.recommendations.fans_liked.forEach(like => {
                if (nodeIds.has(like)) {
                    links.push({ source: game.id, target: like });
                } else {
                    console.warn(`Node not found: ${like}`); // not needed anymore if using clean dataset
                }
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
            event.stopPropagation();
            const game = data.find(game => game.id === d.id);
            card.classed('hidden', false)
                .html(`<h3>${game.title}</h3><p>${game.year}</p>`)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY + 10) + 'px');
            console.log('Card shown:', game);
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

        // Apply Local Edge Lens
        applyLocalEdgeLens(svg, node, link, width, height);
    };
    document.addEventListener('click', () => {
        card.classed('hidden', true);
        console.log('Card hidden');
    });

    // Prevent card from hiding when clicking on the card itself
    card.on('click', (event) => {
        event.stopPropagation();
    });

    const fillOptions = (id, key) => {
        fetchData().then(data => {
            const values = [...new Set(data.map(game => game[key]))];
            values.sort((a, b) => a - b);
            const select = document.getElementById(id);
            values.forEach(value => {
                const option = document.createElement('option');
                option.value = value;
                option.text = value;
                select.add(option);
            });
        });
    };

    const filterAndUpdateGraph = () => {
        const year = document.getElementById('year').value;
        const minplayers = document.getElementById('minplayers').value;
        const maxplayers = document.getElementById('maxplayers').value;
        const minplaytime = document.getElementById('minplaytime').value;
        const maxplaytime = document.getElementById('maxplaytime').value;
        const minage = document.getElementById('minage').value;

        fetchData(year, minplayers, maxplayers, minplaytime, maxplaytime, minage).then(data => updateGraph(data));
    };

    // previously written like this
    // document.getElementById('year').addEventListener('change', filterAndUpdateGraph);
    // document.getElementById('minplayers').addEventListener('change', filterAndUpdateGraph);
    // document.getElementById('maxplayers').addEventListener('change', filterAndUpdateGraph);
    // document.getElementById('minplaytime').addEventListener('change', filterAndUpdateGraph);
    // document.getElementById('maxplaytime').addEventListener('change', filterAndUpdateGraph);
    // document.getElementById('minage').addEventListener('change', filterAndUpdateGraph);
    //
    // fillOptions('year', 'year');
    // fillOptions('minplayers', 'minplayers');
    // fillOptions('maxplayers', 'maxplayers');
    // fillOptions('minplaytime', 'minplaytime');
    // fillOptions('maxplaytime', 'maxplaytime');
    // fillOptions('minage', 'minage');

    ['year', 'minplayers', 'maxplayers', 'minplaytime', 'maxplaytime', 'minage'].forEach(classification => {
        document.getElementById(classification).addEventListener('change', filterAndUpdateGraph);
        fillOptions(classification, classification);
    });

    fetchData().then(data => updateGraph(data));
});