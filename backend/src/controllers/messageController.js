const pool = require('../config/db');

exports.getConversations = async (req, res) => {
  try {
    const [conversations] = await pool.query(
      `SELECT c.id, c.created_at,
        (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
        (SELECT created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message_at,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != ? AND m.is_read = FALSE) AS unread_count
       FROM conversations c
       JOIN conversation_participants cp ON c.id = cp.conversation_id
       WHERE cp.user_id = ?
       ORDER BY last_message_at DESC`,
      [req.user.id, req.user.id]
    );

    for (const conv of conversations) {
      const [participants] = await pool.query(
        `SELECT u.id, u.full_name, u.profile_photo, u.role
         FROM conversation_participants cp
         JOIN users u ON cp.user_id = u.id
         WHERE cp.conversation_id = ? AND cp.user_id != ?`,
        [conv.id, req.user.id]
      );
      conv.participants = participants;
    }

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrCreateConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;
    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }
    if (recipientId == req.user.id) {
      return res.status(400).json({ message: 'Cannot message yourself' });
    }

    const [existing] = await pool.query(
      `SELECT c.id FROM conversations c
       JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = ?
       JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = ?`,
      [req.user.id, recipientId]
    );

    if (existing.length) {
      return res.json({ conversationId: existing[0].id });
    }

    const [result] = await pool.query('INSERT INTO conversations () VALUES ()');
    const convId = result.insertId;
    await pool.query(
      'INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)',
      [convId, req.user.id, convId, recipientId]
    );

    res.status(201).json({ conversationId: convId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const [participant] = await pool.query(
      'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversationId, req.user.id]
    );
    if (!participant.length) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [messages] = await pool.query(
      `SELECT m.*, u.full_name AS sender_name, u.profile_photo AS sender_photo
       FROM messages m JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC`,
      [conversationId]
    );

    await pool.query(
      'UPDATE messages SET is_read = TRUE, read_at = NOW() WHERE conversation_id = ? AND sender_id != ?',
      [conversationId, req.user.id]
    );

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, message_type } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const [participant] = await pool.query(
      'SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?',
      [conversationId, req.user.id]
    );
    if (!participant.length) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [result] = await pool.query(
      'INSERT INTO messages (conversation_id, sender_id, content, message_type) VALUES (?, ?, ?, ?)',
      [conversationId, req.user.id, content, message_type || 'text']
    );

    const [messages] = await pool.query(
      `SELECT m.*, u.full_name AS sender_name, u.profile_photo AS sender_photo
       FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = ?`,
      [result.insertId]
    );

    const [otherParticipants] = await pool.query(
      'SELECT user_id FROM conversation_participants WHERE conversation_id = ? AND user_id != ?',
      [conversationId, req.user.id]
    );
    for (const p of otherParticipants) {
      const [sender] = await pool.query('SELECT full_name FROM users WHERE id = ?', [req.user.id]);
      const senderName = sender[0]?.full_name || 'Someone';
      await pool.query(
        'INSERT INTO notifications (user_id, title, body, type, link) VALUES (?, ?, ?, ?, ?)',
        [p.user_id, 'New message', `${senderName} sent you a message`, 'message', `/messages/${conversationId}`]
      );
    }

    res.status(201).json(messages[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
