// script that handles dropdowns, visibility toggling, and checkbox interactions
document.addEventListener('DOMContentLoaded', () => {
    // show dropdown when button is clicked
    document.querySelectorAll('.dropbtn').forEach(button => {
        button.addEventListener('click', () => {
            const currentDropdown = button.nextElementSibling;

            // close other dropdowns when clicking new dropdown (delete this if you want multiple dropdowns)
            document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                if (dropdown !== currentDropdown) {
                    dropdown.classList.remove('show');
                }
            });

            // toggle current dropdown
            currentDropdown.classList.toggle('show');
        });
    });

    // prevent dropdown from closing when clicking inside it
    document.querySelectorAll('.dropdown-content').forEach(dropdown => {
        dropdown.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    });

    // close dropdown with clicking outside
    window.addEventListener('click', (event) => {
        if (!event.target.matches('.dropbtn')) {
            document.querySelectorAll('.dropdown-content').forEach(dropdown => {
                if (dropdown.classList.contains('show')) {
                    dropdown.classList.remove('show');
                }
            });
        }
    });
});