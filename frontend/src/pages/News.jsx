import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { getPosts, getPostBySlug } from '../services/firestore';

export default function News() {
  const { slug } = useParams();
  const [posts, setPosts] = useState([]);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (slug) {
      setLoading(true);
      getPostBySlug(slug)
        .then(setPost)
        .catch(() => setPost(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(true);
      getPosts({ category: category || undefined, status: 'published' })
        .then(setPosts)
        .catch(() => setPosts([]))
        .finally(() => setLoading(false));
    }
  }, [slug, category]);

  if (slug) {
    if (loading) return <Layout><div className="loading-screen"><div className="spinner" /></div></Layout>;
    if (!post) return <Layout><p className="empty-text">Post not found.</p></Layout>;

    return (
      <Layout>
        <article className="post-detail">
          {post.cover_image && (
            <img src={post.cover_image} alt={post.title} className="post-cover" />
          )}
          <span className="tag">{post.category}</span>
          <h1>{post.title}</h1>
          <p className="post-meta">
            By {post.author_name} · {(post.published_at || post.created_at)?.toLocaleDateString?.() || '—'}
          </p>
          <div className="post-content">{post.content}</div>
          {post.tags?.length > 0 && (
            <div className="tags-row">
              {post.tags.map((tag) => <span key={tag} className="tag tag-outline">{tag}</span>)}
            </div>
          )}
          <Link to="/news" className="btn btn-outline">← Back to News</Link>
        </article>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1>News & Announcements</h1>
        <p>Stay updated with MUYSA community news</p>
      </div>

      <div className="filter-tabs">
        {['', 'news', 'announcement', 'blog'].map((c) => (
          <button
            key={c || 'all'}
            type="button"
            className={`tab ${category === c ? 'active' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c ? c.charAt(0).toUpperCase() + c.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : posts.length ? (
        <div className="posts-grid">
          {posts.map((p) => (
            <article key={p.id} className="post-card">
              {p.cover_image && (
                <img src={p.cover_image} alt={p.title} className="post-thumb" />
              )}
              <div className="post-body">
                <span className="tag">{p.category}</span>
                <h3><Link to={`/news/${p.slug}`}>{p.title}</Link></h3>
                <p>{p.excerpt || p.content?.slice(0, 150)}</p>
                <span className="meta">{(p.published_at || p.created_at)?.toLocaleDateString?.() || '—'}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-text">No posts yet.</p>
      )}
    </Layout>
  );
}
