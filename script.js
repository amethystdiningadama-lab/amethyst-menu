document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('menu-search');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const menuItems = document.querySelectorAll('.menu-item');
    const noResults = document.getElementById('no-results');

    let currentCategory = 'all';
    let searchQuery = '';

    function filterMenu() {
        let visibleItemsCount = 0;

        menuItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            const itemTitle = item.querySelector('.item-header h3').textContent.toLowerCase();
            const itemDesc = item.querySelector('.description').textContent.toLowerCase();
            
            const matchesCategory = (currentCategory === 'all' || itemCategory === currentCategory);
            const matchesSearch = itemTitle.includes(searchQuery) || itemDesc.includes(searchQuery);

            if (matchesCategory && matchesSearch) {
                item.classList.remove('hidden');
                visibleItemsCount++;
            } else {
                item.classList.add('hidden');
            }
        });

        if (visibleItemsCount === 0) {
            noResults.classList.remove('hidden');
        } else {
            noResults.classList.add('hidden');
        }
    }

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        filterMenu();
    });

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            currentCategory = button.getAttribute('data-category');
            filterMenu();
            
            // በሞባይል ላይ ምድብ ሲነካ ወደ ሜኑ መጀመሪያ ላይ ቀስ ብሎ እንዲሄድ
            const offsetTop = document.getElementById('category-tabs').offsetTop;
            window.scrollTo({
                top: offsetTop - 20,
                behavior: 'smooth'
            });
        });
    });
});
