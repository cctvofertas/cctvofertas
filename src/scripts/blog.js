async function loadArticle() {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('id');
    
    if (!articleId) {
        window.location.href = 'blog.html';
        return;
    }

    try {
        const response = await fetch('../data/blog.json');
        const articles = await response.json();
        const post = articles.find(a => a.id === articleId);

        if (!post) {
            document.getElementById('article-loader').innerHTML = `
                <h2>Artículo no encontrado</h2>
                <a href="blog.html" class="btn btn-primary">Volver al Blog</a>
            `;
            return;
        }

        // Hydrate UI
        document.title = `${post.title} | CCTV OFERTAS`;
        document.getElementById('post-title').textContent = post.title;
        document.getElementById('post-category').textContent = post.category;
        document.getElementById('post-date').textContent = post.date;
        document.getElementById('post-author').textContent = post.author;
        document.getElementById('post-image').src = post.image;
        document.getElementById('post-image').alt = post.title;
        document.getElementById('post-content').innerHTML = post.content;

        // Show body, hide loader
        document.getElementById('article-loader').style.display = 'none';
        document.getElementById('article-body').style.display = 'block';

    } catch (error) {
        console.error('Error loading article:', error);
    }
}

// Start hydration
loadArticle();
