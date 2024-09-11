function fetchData(params = {}) {
    let url = '/api/boardgames';
    let queryParams = new URLSearchParams(params).toString();
    if (queryParams) {
        url += `?${queryParams}`;
    }
    return fetch(url)
        .then(response => response.json());
}

function createCheckboxDropdown(id, key) {
    fetchData().then(data => {
        let values;
        if (key === 'categories' || key === 'mechanics') {
            values = [...new Set(data.flatMap(game => game['types'][key].map(item => item.name)))];
            values.sort();
        } else if (key === 'designer') {
            values = [...new Set(data.flatMap(game => game['credit'][key].map(item => item.name)))];
            values.sort();
        } else {
            values = [...new Set(data.map(game => game[key]))];
        }
        // using no param .sort() with numbers, an example output is: [10, 100, 20, 250, 30, 50, 650, ...]
        // this is why we need a custom comparator for numbers (int in these cases)
        values.sort((a, b) => a - b);
        const container = document.getElementById(id + '-dropdown');
        container.innerHTML = ''; // Clear existing options
        values.forEach(value => {
            const label = document.createElement('label');
            label.innerHTML = `<input type="checkbox" value="${value}"> ${value}`;
            container.appendChild(label);
        });

        // adds event listeners to checkboxes
        container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', filterAndUpdateGraph);
        });
        
        // clear filters button event
        document.getElementById('clear-filters').addEventListener('click', () => {
            document.querySelectorAll('.dropdown-content input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            filterAndUpdateGraph(); // update graph with all filters cleared
        });
    });
}

function getSelectedValues(id) {
    return Array.from(document.querySelectorAll(`#${id}-dropdown input:checked`)).map(input => input.value);
}

function filterAndUpdateGraph() {
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
}