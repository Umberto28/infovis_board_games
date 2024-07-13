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

    const fetchData = (year, minplayers, maxplayers, minplaytime, maxplaytime, minage, categories, mechanics, designer) => {
        let url = '/api/boardgames';
        let params = [];
        if (year) params.push(`year=${year}`);
        if (minplayers) params.push(`minplayers=${minplayers}`);
        if (maxplayers) params.push(`maxplayers=${maxplayers}`);
        if (minplaytime) params.push(`minplaytime=${minplaytime}`);
        if (maxplaytime) params.push(`maxplaytime=${maxplaytime}`);
        if (minage) params.push(`minage=${minage}`);
        if (categories) params.push(`categories=${categories}`);
        if (mechanics) params.push(`mechanics=${mechanics}`);
        if (designer) params.push(`designer=${designer}`);
        if (params.length > 0) url += `?${params.join('&')}`;
        return fetch(url)
            .then(response => response.json());
    };

    const updateGraph = (data) => {
        svg.selectAll("*").remove();

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
                    console.warn(`Node not found: ${like}`); // not needed anymore if using clean dataset
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
            .force('charge', d3.forceManyBody().strength(-100))
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
            let values;
            if (key === 'categories' || key === 'mechanics') {
                values = [...new Set(data.flatMap(game => game['types'][key].map(item => item.name)))];
                values.sort();
            }
            else if (key === 'designer') {
                values = [...new Set(data.flatMap(game => game['credit'][key].map(item => item.name)))];
                values.sort();
            }
            else {
                values = [...new Set(data.map(game => game[key]))];
            }
            // using no param .sort() with numbers, an example output is: [10, 100, 20, 250, 30, 50, 650, ...]
            // this is why we need a custom comparator for numbers (int in these cases)
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
        const categories = document.getElementById('categories').value;
        const mechanics = document.getElementById('mechanics').value;
        const designer = document.getElementById('designer').value;

        fetchData(year, minplayers, maxplayers, minplaytime, maxplaytime, minage,
            categories, mechanics, designer).then(data => updateGraph(data));
    };

    // the following was previously written like this
    // document.getElementById('year').addEventListener('change', filterAndUpdateGraph);
    // document.getElementById('minplayers').addEventListener('change', filterAndUpdateGraph);
    // document.getElementById('maxplayers').addEventListener('change', filterAndUpdateGraph);
    // document.getElementById('minplaytime').addEventListener('change', filterAndUpdateGraph);
    // document.getElementById('maxplaytime').addEventListener('change', filterAndUpdateGraph);
    // document.getElementById('minage').addEventListener('change', filterAndUpdateGraph);
    // fillOptions('year', 'year');
    // fillOptions('minplayers', 'minplayers');
    // fillOptions('maxplayers', 'maxplayers');
    // fillOptions('minplaytime', 'minplaytime');
    // fillOptions('maxplaytime', 'maxplaytime');
    // fillOptions('minage', 'minage');
    ['year', 'minplayers', 'maxplayers', 'minplaytime', 'maxplaytime', 'minage',
        'categories', 'mechanics', 'designer'].forEach(classification => {
        document.getElementById(classification).addEventListener('change', filterAndUpdateGraph);
        fillOptions(classification, classification);
    });

    fetchData().then(data => updateGraph(data));
});