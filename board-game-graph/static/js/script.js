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

    var property = 'year'; // default property, maybe add 'no property'?

    // must define another color scheme, as the following color scheme only contains 10 colors
    // const colorScale = d3.scaleOrdinal(d3.schemeCategory10); // example color scheme
    const colorScale = d3.scaleOrdinal().range(['#85edc3', '#e6a766', '#5288e4', '#e09793', '#af91df', '#dab974', '#53d55a', '#97f1a3', '#a7e290', '#e4d14f', '#e99561', '#3be8a7', '#9ae6b8', '#e6255c', '#d38664', '#7fdeed', '#b0dd9a', '#7097d3', '#4ac8d4', '#e9bcac', '#df9daa', '#e48e9c', '#948ce2', '#a5eedc', '#de938a', '#e04da1', '#dcca85', '#edd7a0', '#d2789f', '#c4ef9b', '#6fbae1', '#eae655', '#2edc3d', '#51c2e1', '#d14ca9', '#dd8470', '#c2ea4f', '#e05789', '#e3b96f', '#bb5ae8', '#475bc5', '#94ebc4', '#d264dc', '#3a33de', '#8972da', '#70e7e2', '#91e2d9', '#a4b3ef', '#cfee9d', '#e03e64', '#b29add', '#c691e6', '#93d77c', '#6a6fe4', '#e04c58', '#48b3d9', '#cd66c3', '#d151e9', '#e285b3', '#dc8eb8', '#9f62d1', '#5ace7c', '#dc67ea', '#dd2873', '#d8e4a1', '#79b4e9', '#abd059', '#59b1d6', '#f1a5e4', '#b537e8', '#a7e772', '#d9d16f', '#a9ebd9', '#cad581', '#c57a41', '#995cd5', '#d1d935', '#6bd762', '#3c4dd0', '#94eff0', '#e4e489', '#e063de', '#8887d9', '#aae6be', '#89d98a', '#69e8e0', '#de74e1', '#9ce192', '#87d798', '#a77ce2', '#cb79e5', '#3660e1', '#c6e48a', '#a6c2e4', '#e29771', '#9b8be8', '#72edac', '#b5ea90', '#77e563', '#50e6b5', '#e367c4', '#e6ce4c', '#59a2d8', '#ed8dd8', '#ad92ec', '#442cd4', '#9e46dd', '#e88c7e', '#c6944c', '#5bde92', '#ec5eb6', '#ddef99', '#cae5ab', '#81d5c4', '#436ec9', '#e19cde', '#e88b8b', '#7db1e6', '#e99f60', '#e26b6e', '#97e184', '#39dc64', '#48b0c5'])

    const updateGraph = (data) => {
        svg.selectAll("*").remove();
        console.log('Data loaded:', data);

        const nodes = data.map(game => ({
            id: game.id,
            name: game.title,
            year: game.year,
            minplayers: game.minplayers,
            maxplayers: game.maxplayers,
            minplaytime: game.minplaytime,
            maxplaytime: game.maxplaytime,
            minage: game.minage,
            rank: game.rank,
            reviews: game.rating.num_of_reviews
            // must also be implemented for other parameters (categories, mechanics, designers)
        }));
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

        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(60).strength(0.05))
            .force('charge', d3.forceManyBody().strength(-100))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collide', d3.forceCollide().radius(21).strength(0.6));

        const link = svg.append('g')
            .selectAll('line')
            .data(links)
            .enter()
            .append('line')
                .attr('stroke', '#636363')
                .attr('stroke-width', '1.2px')
                .attr('stroke-opacity', 0.16);

        const node = svg.append('g')
            .selectAll('circle')
            .data(nodes)
            .enter()
            .append('circle')
                .attr('r', 7) // default radius: if changed, change also for legend.js
                //.attr('fill', '#a30202') // one color
                .attr('fill', d => colorScale(d[property]))
                .attr('stroke', '#fff')
                .attr('stroke-width', '1.5px')
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
                .html(`
                <h2>${game.title}</h2>
                <p><strong>Rank:</strong> ${game.rank}</p>
                <p><strong>Rating:</strong> ${game.rating.rating}</p>
                <p><strong>Reviews:</strong> ${game.rating.num_of_reviews}</p>
                <p><strong>Year:</strong> ${game.year}</p>
                <p><strong>Players:</strong> ${game.minplayers} - ${game.maxplayers}</p>
                <p><strong>Play Time:</strong> ${game.minplaytime} - ${game.maxplaytime} mins</p>
                <p><strong>Age:</strong> ${game.minage}+</p>
                <p><strong>Categories:</strong> ${game.types.categories.map(c => c.name).join(' | ')}</p>
                <p><strong>Mechanics:</strong> ${game.types.mechanics.map(m => m.name).join(' | ')}</p>
                <p><strong>Designer:</strong> ${game.credit.designer.map(d => d.name).join(' | ')}</p>
                `)
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

        // create legend for current property
        addLegend(svg, nodes, colorScale, property);
    };

    /////////////////////////////////////////////////////////////
    //                      CARD HANDLING                      //
    /////////////////////////////////////////////////////////////

    document.addEventListener('click', () => {
        card.classed('hidden', true);
        console.log('Card hidden');
    });

    // Prevent card from hiding when clicking on the card itself
    card.on('click', (event) => {
        event.stopPropagation();
    });

    /////////////////////////////////////////////////////////////
    //             FILTERING AND DROPDOWN CREATION             //
    /////////////////////////////////////////////////////////////

    const fetchData = (params = {}) => {
        let url = '/api/boardgames';
        let queryParams = new URLSearchParams(params).toString();
        if (queryParams) {
            url += `?${queryParams}`;
        }
        return fetch(url)
            .then(response => response.json());
    };

    const createCheckboxDropdown = (id, key) => {
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
                // using no param .sort() with numbers, an example output is: [10, 100, 20, 250, 30, 50, 650, ...]
                // this is why we need a custom comparator for numbers (int in these cases)
                values.sort((a, b) => a - b);
            }

            const container = document.getElementById(id + '-dropdown');
            // container.innerHTML = ''; // Clear existing options, commented for now because 'AND' option is static
            // 'AND' option can also be created here by uncommenting the following line and removing the label in index.html
            // container.appendChild(document.createElement('label').innerHTML = `<input type="checkbox" value="AND"> AND`)
            values.forEach(value => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="checkbox" value="${value}"> ${value}`;
                container.appendChild(label);
            });

            // adds event listeners to checkboxes
            container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                checkbox.addEventListener('change', filterAndUpdateGraph);
            });
        });
    };

    const getSelectedValues = (id) => {
        return Array.from(document.querySelectorAll(`#${id}-dropdown input:checked`)).map(input => input.value);
    };

    const filterAndUpdateGraph = () => {
        const year = getSelectedValues('year');
        const minplayers = getSelectedValues('minplayers');
        const maxplayers = getSelectedValues('maxplayers');
        const minplaytime = getSelectedValues('minplaytime');
        const maxplaytime = getSelectedValues('maxplaytime');
        const minage = getSelectedValues('minage');
        const categories = getSelectedValues('categories');
        const mechanics = getSelectedValues('mechanics');
        const designer = getSelectedValues('designer');

        fetchData({
            year: year.join('|'),
            minplayers: minplayers.join('|'),
            maxplayers: maxplayers.join('|'),
            minplaytime: minplaytime.join('|'),
            maxplaytime: maxplaytime.join('|'),
            minage: minage.join('|'),
            categories: categories.join('|'),
            mechanics: mechanics.join('|'),
            designer: designer.join('|')
        }).then(data => updateGraph(data));
    };

    // clear filters button event
    document.getElementById('clear-filters').addEventListener('click', () => {
        document.querySelectorAll('.dropdown-content input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        fetchData().then(data => updateGraph(data)); // update graph with all filters cleared
    });

    // initialize dropdowns (filling options)
    ['year', 'minplayers', 'maxplayers', 'minplaytime', 'maxplaytime', 'minage', 'categories', 'mechanics', 'designer'].forEach(classification => {
        createCheckboxDropdown(classification, classification);
    });

    // change property event
    document.getElementById('property').addEventListener('change', () => {
        property = document.getElementById('property').value;
        filterAndUpdateGraph();
        // fetchData().then(data => updateGraph(data));
    });

    // initialize graph
    fetchData().then(data => updateGraph(data));
    // previously
    // d3.json('/data').then(data => updateGraph(data));
});