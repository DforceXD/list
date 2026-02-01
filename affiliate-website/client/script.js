const API_URL = 'http://localhost:5000/api';

// DOM Elements
let categoriesContainer = document.getElementById('categoriesContainer');
let linksContainer = document.getElementById('linksContainer');
let categoryFilter = document.getElementById('categoryFilter');
let searchInput = document.getElementById('searchInput');

// Load categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`);
        const categories = await response.json();
        
        displayCategories(categories);
        populateCategoryFilter(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Display categories
function displayCategories(categories) {
    categoriesContainer.innerHTML = '';
    
    categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.innerHTML = `
            <i class="fas fa-folder"></i>
            <h3>${category.name}</h3>
            <p>${category.description || 'Explore links'}</p>
        `;
        categoryCard.addEventListener('click', () => {
            filterByCategory(category.id);
        });
        categoriesContainer.appendChild(categoryCard);
    });
}

// Populate category filter dropdown
function populateCategoryFilter(categories) {
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categoryFilter.appendChild(option);
    });
}

// Load affiliate links
async function loadLinks(categoryId = '', searchTerm = '') {
    try {
        const response = await fetch(`${API_URL}/links`);
        let links = await response.json();
        
        // Filter by category
        if (categoryId) {
            links = links.filter(link => link.category_id == categoryId);
        }
        
        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            links = links.filter(link => 
                link.title.toLowerCase().includes(term) || 
                link.description.toLowerCase().includes(term)
            );
        }
        
        displayLinks(links);
    } catch (error) {
        console.error('Error loading links:', error);
    }
}

// Display links
function displayLinks(links) {
    linksContainer.innerHTML = '';
    
    if (links.length === 0) {
        linksContainer.innerHTML = '<p class="no-results">No links found.</p>';
        return;
    }
    
    links.forEach(link => {
        const linkCard = document.createElement('div');
        linkCard.className = 'link-card';
        linkCard.innerHTML = `
            <div class="link-image" style="background-color: #${Math.floor(Math.random()*16777215).toString(16)};">
                ${link.image_url ? `<img src="${link.image_url}" alt="${link.title}" style="width:100%;height:100%;object-fit:cover;">` : ''}
            </div>
            <div class="link-content">
                <h3>${link.title}</h3>
                <p>${link.description || 'No description available.'}</p>
                <div class="link-stats">
                    <span>${link.category_name || 'Uncategorized'}</span>
                    <span>${link.clicks || 0} clicks</span>
                </div>
                <a href="${link.url}" target="_blank" class="visit-btn" onclick="trackClick(${link.id})">
                    Visit Link <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        `;
        linksContainer.appendChild(linkCard);
    });
}

// Track link click (you would implement this on backend)
function trackClick(linkId) {
    // In a real app, you would send this to your backend
    console.log(`Link ${linkId} clicked`);
}

// Filter by category
function filterByCategory(categoryId) {
    categoryFilter.value = categoryId;
    loadLinks(categoryId, searchInput.value);
}

// Event Listeners
categoryFilter.addEventListener('change', (e) => {
    loadLinks(e.target.value, searchInput.value);
});

searchInput.addEventListener('input', (e) => {
    loadLinks(categoryFilter.value, e.target.value);
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadLinks();
});
