import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, onSnapshot, writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';

const slugify = (text) =>
  text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

const toDate = (val) => {
  if (!val) return null;
  if (val.toDate) return val.toDate();
  return new Date(val);
};

const mapDoc = (snap) => {
  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    created_at: toDate(data.created_at),
    updated_at: toDate(data.updated_at),
    published_at: toDate(data.published_at),
    start_datetime: toDate(data.start_datetime),
    end_datetime: toDate(data.end_datetime),
    deadline: data.deadline,
  };
};

export const uploadFile = async (path, file) => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  } catch (err) {
    console.warn('File upload skipped (Storage may require Blaze plan):', err.message);
    return null;
  }
};

// ─── Users ───────────────────────────────────────────────────────────────────

export const getUser = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getAllUsers = async (search = '') => {
  const snap = await getDocs(collection(db, 'users'));
  let users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (search) {
    const term = search.toLowerCase();
    users = users.filter(
      (u) =>
        u.full_name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.course?.toLowerCase().includes(term)
    );
  }
  return users.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
};

export const getAllMembers = async (search = '', roleFilter = '') => {
  const snap = await getDocs(collection(db, 'users'));
  let members = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((u) => u.is_active !== false && ['student', 'alumni'].includes(u.role));

  if (roleFilter) members = members.filter((m) => m.role === roleFilter);
  if (search) {
    const term = search.toLowerCase();
    members = members.filter(
      (m) =>
        m.full_name?.toLowerCase().includes(term) ||
        m.course?.toLowerCase().includes(term)
    );
  }
  return members.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
};

export const updateMemberProfile = async (uid, data) => {
  const user = await getUser(uid);
  if (!user) throw new Error('User not found');

  const { full_name, course, phone, bio } = data;
  const updates = { updated_at: serverTimestamp() };
  if (full_name !== undefined) updates.full_name = full_name;
  if (course !== undefined) updates.course = course;
  if (phone !== undefined) updates.phone = phone;
  if (bio !== undefined) updates.bio = bio;

  await updateDoc(doc(db, 'users', uid), updates);

  if (['student', 'alumni'].includes(user.role) && course !== undefined) {
    const profileCol = user.role === 'alumni' ? 'alumni_profiles' : 'student_profiles';
    await setDoc(
      doc(db, profileCol, uid),
      { user_id: uid, course, updated_at: serverTimestamp() },
      { merge: true }
    );
  }

  return getUser(uid);
};

export const updateUser = async (uid, data) => {
  await updateDoc(doc(db, 'users', uid), { ...data, updated_at: serverTimestamp() });
  if ('role' in data || 'is_active' in data) {
    await refreshMemberStats();
  }
  return getUser(uid);
};

export const deactivateUser = async (uid) => {
  await updateDoc(doc(db, 'users', uid), { is_active: false, updated_at: serverTimestamp() });
  await refreshMemberStats();
};

const computeMemberStats = (users) => {
  const active = users.filter((u) => u.is_active !== false);
  const currentStudents = active.filter((u) => u.role === 'student').length;
  const alumniMembers = active.filter((u) => u.role === 'alumni').length;
  return {
    totalMembers: currentStudents + alumniMembers,
    currentStudents,
    alumniMembers,
  };
};

export const refreshMemberStats = async () => {
  const usersSnap = await getDocs(collection(db, 'users'));
  const users = usersSnap.docs.map((d) => d.data());
  const stats = computeMemberStats(users);
  try {
    await setDoc(doc(db, 'stats', 'members'), { ...stats, updated_at: serverTimestamp() });
  } catch {
    // Public stats doc optional until rules are deployed
  }
  return stats;
};

export const getMemberStats = async () => {
  try {
    const snap = await getDoc(doc(db, 'stats', 'members'));
    if (snap.exists()) return snap.data();
  } catch {
    // Public read may be unavailable before rules are deployed
  }
  try {
    return await refreshMemberStats();
  } catch {
    return { totalMembers: 0, currentStudents: 0, alumniMembers: 0 };
  }
};

export const getDashboardStats = async () => {
  const [memberStats, eventsSnap, jobsSnap, postsSnap] = await Promise.all([
    getMemberStats(),
    getDocs(query(collection(db, 'events'), where('status', '==', 'upcoming'))),
    getDocs(query(collection(db, 'jobs'), where('is_active', '==', true))),
    getDocs(query(collection(db, 'posts'), where('status', '==', 'published'))),
  ]);
  return {
    ...memberStats,
    upcomingEvents: eventsSnap.size,
    activeJobs: jobsSnap.size,
    publishedPosts: postsSnap.size,
  };
};

// ─── Student Profiles ────────────────────────────────────────────────────────

export const getStudents = async (search = '') => {
  const [usersSnap, profilesSnap] = await Promise.all([
    getDocs(query(collection(db, 'users'), where('role', '==', 'student'))),
    getDocs(collection(db, 'student_profiles')),
  ]);
  const profiles = Object.fromEntries(profilesSnap.docs.map((d) => [d.id, d.data()]));
  let students = usersSnap.docs
    .filter((d) => d.data().is_active !== false)
    .map((d) => ({
      user_id: d.id,
      full_name: d.data().full_name,
      email: d.data().email,
      phone: d.data().phone,
      profile_photo: d.data().profile_photo,
      bio: d.data().bio,
      ...profiles[d.id],
      course: profiles[d.id]?.course || d.data().course || '',
    }));

  if (search) {
    const term = search.toLowerCase();
    students = students.filter(
      (s) =>
        s.full_name?.toLowerCase().includes(term) ||
        s.course?.toLowerCase().includes(term) ||
        s.hometown?.toLowerCase().includes(term)
    );
  }
  return students.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
};

// ─── Alumni Profiles ─────────────────────────────────────────────────────────

export const getAlumni = async (search = '', mentorOnly = false) => {
  const [usersSnap, profilesSnap] = await Promise.all([
    getDocs(query(collection(db, 'users'), where('role', '==', 'alumni'))),
    getDocs(collection(db, 'alumni_profiles')),
  ]);
  const profiles = Object.fromEntries(profilesSnap.docs.map((d) => [d.id, d.data()]));
  let alumni = usersSnap.docs
    .filter((d) => d.data().is_active !== false)
    .map((d) => ({
      user_id: d.id,
      full_name: d.data().full_name,
      email: d.data().email,
      phone: d.data().phone,
      profile_photo: d.data().profile_photo,
      bio: d.data().bio,
      ...profiles[d.id],
      course: profiles[d.id]?.course || d.data().course || '',
    }));

  if (mentorOnly) alumni = alumni.filter((a) => a.willing_to_mentor);
  if (search) {
    const term = search.toLowerCase();
    alumni = alumni.filter(
      (a) =>
        a.full_name?.toLowerCase().includes(term) ||
        a.current_employer?.toLowerCase().includes(term) ||
        a.course?.toLowerCase().includes(term)
    );
  }
  return alumni.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
};

// ─── Posts ───────────────────────────────────────────────────────────────────

export const getPosts = async ({ category, status = 'published' } = {}) => {
  let q = query(collection(db, 'posts'), where('status', '==', status), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  let posts = await Promise.all(
    snap.docs.map(async (d) => {
      const post = mapDoc(d);
      const author = await getUser(post.user_id);
      return { ...post, author_name: author?.full_name, author_photo: author?.profile_photo };
    })
  );
  if (category) posts = posts.filter((p) => p.category === category);
  return posts;
};

export const getPostBySlug = async (slug) => {
  const snap = await getDocs(query(collection(db, 'posts'), where('slug', '==', slug)));
  if (!snap.empty) {
    const post = mapDoc(snap.docs[0]);
    const author = await getUser(post.user_id);
    return { ...post, author_name: author?.full_name, author_photo: author?.profile_photo };
  }
  return null;
};

export const createPost = async (userId, data, coverFile) => {
  const slug = `${slugify(data.title)}-${Date.now()}`;
  let cover_image = null;
  if (coverFile) {
    cover_image = await uploadFile(`posts/${Date.now()}_${coverFile.name}`, coverFile);
  }
  const tags = data.tags
    ? (typeof data.tags === 'string'
      ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : data.tags)
    : [];

  const docRef = await addDoc(collection(db, 'posts'), {
    user_id: userId,
    title: data.title,
    slug,
    content: data.content,
    excerpt: data.excerpt || '',
    cover_image,
    category: data.category || 'news',
    status: data.status || 'published',
    tags,
    published_at: data.status === 'draft' ? null : serverTimestamp(),
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  return { id: docRef.id, slug };
};

// ─── Events ──────────────────────────────────────────────────────────────────

export const getEvents = async (status = 'upcoming') => {
  const snap = await getDocs(
    query(collection(db, 'events'), where('status', '==', status), orderBy('start_datetime', 'asc'))
  );
  return Promise.all(
    snap.docs.map(async (d) => {
      const event = mapDoc(d);
      const regSnap = await getDocs(collection(db, 'events', d.id, 'registrations'));
      const organiser = await getUser(event.user_id);
      return {
        ...event,
        registration_count: regSnap.size,
        organiser_name: organiser?.full_name,
      };
    })
  );
};

export const registerForEvent = async (eventId, userId) => {
  const eventRef = doc(db, 'events', eventId);
  const eventSnap = await getDoc(eventRef);
  if (!eventSnap.exists()) throw new Error('Event not found');

  const event = eventSnap.data();
  if (event.max_attendees) {
    const regSnap = await getDocs(collection(db, 'events', eventId, 'registrations'));
    if (regSnap.size >= event.max_attendees) throw new Error('Event is full');
  }

  await setDoc(doc(db, 'events', eventId, 'registrations', userId), {
    user_id: userId,
    registered_at: serverTimestamp(),
    attended: false,
  });
};

// ─── Jobs ────────────────────────────────────────────────────────────────────

export const getJobs = async () => {
  const snap = await getDocs(
    query(collection(db, 'jobs'), where('is_active', '==', true), orderBy('created_at', 'desc'))
  );
  return Promise.all(
    snap.docs.map(async (d) => {
      const job = mapDoc(d);
      const poster = await getUser(job.user_id);
      return { ...job, poster_name: poster?.full_name };
    })
  );
};

export const createJob = async (userId, data) => {
  const docRef = await addDoc(collection(db, 'jobs'), {
    ...data,
    user_id: userId,
    is_active: true,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  return docRef.id;
};

export const applyForJob = async (jobId, userId, coverLetter) => {
  const existing = await getDoc(doc(db, 'jobs', jobId, 'applications', userId));
  if (existing.exists()) throw new Error('Already applied');
  await setDoc(doc(db, 'jobs', jobId, 'applications', userId), {
    user_id: userId,
    cover_letter: coverLetter,
    status: 'pending',
    applied_at: serverTimestamp(),
  });
};

// ─── Executives ──────────────────────────────────────────────────────────────

export const getExecutives = async (activeOnly = true) => {
  const snap = await getDocs(collection(db, 'executives'));
  let executives = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (activeOnly) executives = executives.filter((e) => e.is_active !== false);
  return executives.sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99));
};

export const createExecutive = async (data) => {
  const docRef = await addDoc(collection(db, 'executives'), {
    full_name: data.full_name,
    post: data.post,
    course: data.course || '',
    phone: data.phone || '',
    email: data.email || '',
    academic_year: data.academic_year || '',
    sort_order: parseInt(data.sort_order, 10) || 99,
    is_active: data.is_active !== false,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  return docRef.id;
};

export const updateExecutive = async (id, data) => {
  const updates = { updated_at: serverTimestamp() };
  if (data.full_name !== undefined) updates.full_name = data.full_name;
  if (data.post !== undefined) updates.post = data.post;
  if (data.course !== undefined) updates.course = data.course;
  if (data.phone !== undefined) updates.phone = data.phone;
  if (data.email !== undefined) updates.email = data.email;
  if (data.academic_year !== undefined) updates.academic_year = data.academic_year;
  if (data.is_active !== undefined) updates.is_active = data.is_active;
  if (data.sort_order !== undefined) updates.sort_order = parseInt(data.sort_order, 10) || 99;
  await updateDoc(doc(db, 'executives', id), updates);
};

export const deleteExecutive = async (id) => {
  await deleteDoc(doc(db, 'executives', id));
};

// ─── Messages ────────────────────────────────────────────────────────────────

const conversationId = (uid1, uid2) => [uid1, uid2].sort().join('_');

export const getOrCreateConversation = async (currentUid, recipientId) => {
  const convId = conversationId(currentUid, recipientId);
  const convRef = doc(db, 'conversations', convId);
  const convSnap = await getDoc(convRef);
  if (!convSnap.exists()) {
    await setDoc(convRef, {
      participantIds: [currentUid, recipientId],
      created_at: serverTimestamp(),
      last_message: '',
      last_message_at: serverTimestamp(),
    });
  }
  return convId;
};

export const getConversations = async (userId) => {
  const snap = await getDocs(
    query(collection(db, 'conversations'), where('participantIds', 'array-contains', userId))
  );
  return Promise.all(
    snap.docs.map(async (d) => {
      const data = d.data();
      const otherId = data.participantIds.find((id) => id !== userId);
      const other = otherId ? await getUser(otherId) : null;
      const msgSnap = await getDocs(collection(db, 'conversations', d.id, 'messages'));
      const unread = msgSnap.docs.filter(
        (m) => m.data().sender_id !== userId && !m.data().is_read
      ).length;
      return {
        id: d.id,
        ...data,
        last_message_at: toDate(data.last_message_at),
        participants: other ? [{ id: other.id, full_name: other.full_name, profile_photo: other.profile_photo, role: other.role }] : [],
        unread_count: unread,
      };
    })
  );
};

export const subscribeToMessages = (convId, callback) => {
  const q = query(collection(db, 'conversations', convId, 'messages'), orderBy('created_at', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      created_at: toDate(d.data().created_at),
    })));
  });
};

export const sendMessage = async (convId, senderId, content) => {
  const msgRef = await addDoc(collection(db, 'conversations', convId, 'messages'), {
    sender_id: senderId,
    content,
    message_type: 'text',
    is_read: false,
    created_at: serverTimestamp(),
  });
  await updateDoc(doc(db, 'conversations', convId), {
    last_message: content,
    last_message_at: serverTimestamp(),
  });
  return msgRef.id;
};

export const markMessagesRead = async (convId, readerId) => {
  const snap = await getDocs(collection(db, 'conversations', convId, 'messages'));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => {
    if (d.data().sender_id !== readerId && !d.data().is_read) {
      batch.update(d.ref, { is_read: true, read_at: serverTimestamp() });
    }
  });
  await batch.commit();
};
