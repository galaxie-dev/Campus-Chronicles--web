document.addEventListener('DOMContentLoaded', () => {
    const newsForm = document.getElementById('addNewsForm');
    const newsList = document.getElementById('newsList');

    // Show/Hide news form
    window.showNewsForm = () => {
        document.getElementById('newsForm').style.display = 'block';
    };

    window.hideNewsForm = () => {
        document.getElementById('newsForm').style.display = 'none';
        newsForm.reset();
    };

    // Handle form submission
    newsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('title').value,
            content: document.getElementById('content').value,
            category: document.getElementById('category').value,
            imageUrl: document.getElementById('imageUrl').value,
            keywords: document.getElementById('keywords').value.split(',').map(k => k.trim())
        };

        try {
            const response = await fetch('/api/news', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                hideNewsForm();
                fetchNewsList();
                showNotification('Article published successfully!', 'success');
            } else {
                throw new Error('Failed to publish article');
            }
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });

    // Fetch and display news list
    async function fetchNewsList() {
        try {
            const response = await fetch('/api/news');
            const news = await response.json();
            
            newsList.innerHTML = news.map(article => `
                <div class="news-item" data-id="${article._id}">
                    <div class="news-item-content">
                        <h3>${article.title}</h3>
                        <span class="category">${article.category}</span>
                        <span class="date">${new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="news-item-actions">
                        <button onclick="editNews('${article._id}')" class="edit-btn">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteNews('${article._id}')" class="delete-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            showNotification('Error fetching news list', 'error');
        }
    }

    // Delete news article
    window.deleteNews = async (id) => {
        if (confirm('Are you sure you want to delete this article?')) {
            try {
                const response = await fetch(`/api/news/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    fetchNewsList();
                    showNotification('Article deleted successfully!', 'success');
                } else {
                    throw new Error('Failed to delete article');
                }
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    };

    // Edit news article
    window.editNews = async (id) => {
        try {
            const response = await fetch(`/api/news/${id}`);
            const article = await response.json();

            document.getElementById('title').value = article.title;
            document.getElementById('content').value = article.content;
            document.getElementById('category').value = article.category;
            document.getElementById('imageUrl').value = article.imageUrl;
            document.getElementById('keywords').value = article.keywords.join(', ');

            showNewsForm();
            newsForm.dataset.editId = id;
        } catch (error) {
            showNotification('Error loading article', 'error');
        }
    };

    // Show notification
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Initial news list fetch
    fetchNewsList();
});
