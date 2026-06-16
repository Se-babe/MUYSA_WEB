const pool = require('../config/db');

const slugify = (text) =>
  text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

exports.getAllPosts = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = `
      SELECT p.*, u.full_name AS author_name, u.profile_photo AS author_photo
      FROM posts p JOIN users u ON p.user_id = u.id WHERE 1=1
    `;
    const params = [];

    if (category) { query += ' AND p.category = ?'; params.push(category); }
    if (status) { query += ' AND p.status = ?'; params.push(status); }
    else { query += " AND p.status = 'published'"; }
    if (search) {
      query += ' AND (p.title LIKE ? OR p.content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.published_at DESC, p.created_at DESC';
    const [posts] = await pool.query(query, params);

    for (const post of posts) {
      const [tags] = await pool.query('SELECT tag FROM post_tags WHERE post_id = ?', [post.id]);
      post.tags = tags.map((t) => t.tag);
    }
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPostBySlug = async (req, res) => {
  try {
    const [posts] = await pool.query(
      `SELECT p.*, u.full_name AS author_name, u.profile_photo AS author_photo
       FROM posts p JOIN users u ON p.user_id = u.id
       WHERE p.slug = ?`,
      [req.params.slug]
    );
    if (!posts.length) return res.status(404).json({ message: 'Post not found' });

    const [tags] = await pool.query('SELECT tag FROM post_tags WHERE post_id = ?', [posts[0].id]);
    posts[0].tags = tags.map((t) => t.tag);
    res.json(posts[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, content, excerpt, category, status, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const slug = `${slugify(title)}-${Date.now()}`;
    const coverImage = req.file ? `/uploads/${req.file.filename}` : null;
    const postStatus = status || 'draft';
    const publishedAt = postStatus === 'published' ? new Date() : null;

    const [result] = await pool.query(
      `INSERT INTO posts (user_id, title, slug, content, excerpt, cover_image, category, status, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, slug, content, excerpt, coverImage, category || 'news', postStatus, publishedAt]
    );

    if (tags) {
      const tagList = typeof tags === 'string' ? JSON.parse(tags) : tags;
      for (const tag of tagList) {
        await pool.query('INSERT INTO post_tags (post_id, tag) VALUES (?, ?)', [result.insertId, tag]);
      }
    }

    const [posts] = await pool.query('SELECT * FROM posts WHERE id = ?', [result.insertId]);
    res.status(201).json(posts[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ message: 'Post not found' });
    if (existing[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, content, excerpt, category, status, tags } = req.body;
    const coverImage = req.file ? `/uploads/${req.file.filename}` : existing[0].cover_image;
    const publishedAt = status === 'published' && !existing[0].published_at ? new Date() : existing[0].published_at;

    await pool.query(
      `UPDATE posts SET title = ?, content = ?, excerpt = ?, cover_image = ?,
       category = ?, status = ?, published_at = ? WHERE id = ?`,
      [title || existing[0].title, content || existing[0].content, excerpt,
       coverImage, category || existing[0].category, status || existing[0].status, publishedAt, id]
    );

    if (tags) {
      await pool.query('DELETE FROM post_tags WHERE post_id = ?', [id]);
      const tagList = typeof tags === 'string' ? JSON.parse(tags) : tags;
      for (const tag of tagList) {
        await pool.query('INSERT INTO post_tags (post_id, tag) VALUES (?, ?)', [id, tag]);
      }
    }

    const [posts] = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
    res.json(posts[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ message: 'Post not found' });
    if (existing[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    await pool.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
