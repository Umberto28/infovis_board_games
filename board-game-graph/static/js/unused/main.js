document.addEventListener('DOMContentLoaded', () => {

    // initialize dropdowns (filling options)
    ['year', 'minplayers', 'maxplayers', 'minplaytime', 'maxplaytime', 'minage', 'categories', 'mechanics', 'designer'].forEach(classification => {
        createCheckboxDropdown(classification, classification);
    });

    // initialize graph
    filterAndUpdateGraph();
});