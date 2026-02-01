const API_URL = 'http://localhost:5000/api';
let token = localStorage.getItem('adminToken');

// DOM Elements
const loginPage = document.getElementById('loginPage');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

// Check if user is already logged in
if (token) {
    checkAuth();
}

// Login function
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            token = data.token;
            localStorage.setItem('adminToken', token);
            showDashboard();
        } else {
            loginError.textContent = data.error || 'Login failed';
        }
    } catch (error) {
        loginError.textContent = 'Network error. Please try again.';
    }
});

// Check authentication
async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/admin/check-auth`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            showDashboard();
        } else {
            localStorage.removeItem('adminToken');
            token = null;
        }
    } catch (error) {
        localStorage.removeItem('adminToken');
        token = null;
    }
}

// Show dashboard
function showDashboard() {
    loginPage.style.display = 'none';
    dashboard.style.display = 'flex';
    loadLinks();
    loadCategories();
    showSection('links');
}

// Logout
function logout() {
    localStorage.removeItem('adminToken');
    token = null;
    dashboard.style.display = 'none';
    loginPage.style.display = 'flex';
    loginForm.reset();
}

// Section navigation
function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(`${sectionName}Section`).style.display = 'block';
}

// Load links for admin
async function loadLinks() {
    try {
        const response = await fetch(`${API_URL}/admin/links`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const links = await response.json();
        displayLinksTable(links);
    } catch (error) {
        console.error('Error loading links:', error);
    }
}

// Display links in table
function displayLinksTable(links) {
    const tableBody = document.getElementById('linksTable');
    tableBody.innerHTML = '';
    
    links.forEach(link => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${link.title}</td>
            <td><a href="${link.url}" target="_blank">${link.url.substring(0, 30)}...</a></td>
            <td>${link.category_name || 'Uncategorized'}</td>
            <td>${link.clicks || 0}</td>
            <td class="${link.is_active ? 'status-active' : 'status-inactive'}">
                ${link.is_active ? 'Active' : 'Inactive'}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editLink(${link.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteLink(${link.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Load categories for admin
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/admin/categories`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const categories = await response.json();
        displayCategoriesTable(categories);
        populateCategoryDropdown(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Display categories in table
function displayCategoriesTable(categories) {
    const tableBody = document.getElementById('categoriesTable');
    tableBody.innerHTML = '';
    
    categories.forEach(category => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category.name}</td>
            <td>${category.description || ''}</td>
            <td class="${category.is_active ? 'status-active' : 'status-inactive'}">
                ${category.is_active ? 'Active' : 'Inactive'}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editCategory(${category.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteCategory(${category.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Populate category dropdown in link form
function populateCategoryDropdown(categories) {
    const dropdown = document.getElementById('linkCategory');
    dropdown.innerHTML = '<option value="">Select Category</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        dropdown.appendChild(option);
    });
}

// Link Form Functions
function showLinkForm(linkId = null) {
    document.getElementById('linkForm').style.display = 'block';
    document.getElementById('formTitle').textContent = linkId ? 'Edit Link' : 'Add New Link';
    document.getElementById('linkId').value = linkId || '';
    
    if (linkId) {
        // Load link data for editing
        fetchLinkDetails(linkId);
    } else {
        document.getElementById('linkFormElement').reset();
        document.getElementById('linkActive').checked = true;
    }
}

function hideLinkForm() {
    document.getElementById('linkForm').style.display = 'none';
}

async function fetchLinkDetails(linkId) {
    try {
        const response = await fetch(`${API_URL}/admin/links`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const links = await response.json();
        const link = links.find(l => l.id == linkId);
        
        if (link) {
            document.getElementById('linkTitle').value = link.title;
            document.getElementById('linkDescription').value = link.description || '';
            document.getElementById('linkUrl').value = link.url;
            document.getElementById('linkImage').value = link.image_url || '';
            document.getElementById('linkCategory').value = link.category_id || '';
            document.getElementById('linkActive').checked = link.is_active;
        }
    } catch (error) {
        console.error('Error fetching link details:', error);
    }
}

// Handle link form submission
document.getElementById('linkFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const linkId = document.getElementById('linkId').value;
    const linkData = {
        title: document.getElementById('linkTitle').value,
        description: document.getElementById('linkDescription').value,
        url: document.getElementById('linkUrl').value,
        image_url: document.getElementById('linkImage').value,
        category_id: document.getElementById('linkCategory').value,
        is_active: document.getElementById('linkActive').checked ? 1 : 0
    };
    
    try {
        const url = linkId ? 
            `${API_URL}/admin/links/${linkId}` : 
            `${API_URL}/admin/links`;
        
        const method = linkId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(linkData)
        });
        
        if (response.ok) {
            hideLinkForm();
            loadLinks();
        } else {
            alert('Error saving link');
        }
    } catch (error) {
        console.error('Error saving link:', error);
    }
});

// Delete link
async function deleteLink(linkId) {
    if (!confirm('Are you sure you want to delete this link?')) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/links/${linkId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            loadLinks();
        }
    } catch (error) {
        console.error('Error deleting link:', error);
    }
}

// Edit link
function editLink(linkId) {
    showLinkForm(linkId);
}

// Category Form Functions (similar to link functions)
function showCategoryForm(categoryId = null) {
    document.getElementById('categoryForm').style.display = 'block';
    document.getElementById('categoryFormTitle').textContent = categoryId ? 'Edit Category' : 'Add New Category';
    document.getElementById('categoryId').value = categoryId || '';
    
    if (categoryId) {
        fetchCategoryDetails(categoryId);
    } else {
        document.getElementById('categoryFormElement').reset();
        document.getElementById('categoryActive').checked = true;
    }
}

function hideCategoryForm() {
    document.getElementById('categoryForm').style.display = 'none';
}

async function fetchCategoryDetails(categoryId) {
    try {
        const response = await fetch(`${API_URL}/admin/categories`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const categories = await response.json();
        const category = categories.find(c => c.id == categoryId);
        
        if (category) {
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categoryDescription').value = category.description || '';
            document.getElementById('categoryActive').checked = category.is_active;
        }
    } catch (error) {
        console.error('Error fetching category details:', error);
    }
}

// Handle category form submission
document.getElementById('categoryFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const categoryId = document.getElementById('categoryId').value;
    const categoryData = {
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value,
        is_active: document.getElementById('categoryActive').checked ? 1 : 0
    };
    
    try {
        const url = categoryId ? 
            `${API_URL}/admin/categories/${categoryId}` : 
            `${API_URL}/admin/categories`;
        
        const method = categoryId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(categoryData)
        });
        
        if (response.ok) {
            hideCategoryForm();
            loadCategories();
        } else {
            alert('Error saving category');
        }
    } catch (error) {
        console.error('Error saving category:', error);
    }
});

// Delete category
async function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category? This may affect linked items.')) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/categories/${categoryId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            loadCategories();
        }
    } catch (error) {
        console.error('Error deleting category:', error);
    }
}

// Edit category
function editCategory(categoryId) {
    showCategoryForm(categoryId);
}
