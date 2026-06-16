import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getEvents, registerForEvent } from '../services/firestore';
import { FiMapPin, FiClock, FiUsers } from 'react-icons/fi';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    setLoading(true);
    getEvents(filter)
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const register = async (eventId) => {
    if (!user) return;
    try {
      await registerForEvent(eventId, user.id);
      alert('Registered successfully!');
    } catch (err) {
      alert(err.message || 'Registration failed');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Events</h1>
          <p>MUYSA community events and activities</p>
        </div>
        <Link to="/events/gallery" className="btn btn-outline btn-sm">Event photo gallery</Link>
      </div>

      <div className="filter-tabs">
        {['upcoming', 'ongoing', 'past'].map((s) => (
          <button
            key={s}
            type="button"
            className={`tab ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : events.length ? (
        <div className="events-grid">
          {events.map((event) => (
            <article key={event.id} className="event-card">
              {event.cover_image && (
                <img src={event.cover_image} alt={event.title} className="event-cover" />
              )}
              <div className="event-body">
                <span className={`tag tag-${event.event_type}`}>{event.event_type}</span>
                <h3>{event.title}</h3>
                <p className="event-desc">{event.description?.slice(0, 120)}...</p>
                <div className="event-meta">
                  <span><FiClock /> {event.start_datetime?.toLocaleString?.() || '—'}</span>
                  {event.location && <span><FiMapPin /> {event.location}</span>}
                  <span><FiUsers /> {event.registration_count || 0} registered</span>
                </div>
                {filter === 'upcoming' && event.registration_required && user && (
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => register(event.id)}>
                    Register
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-text">No {filter} events found.</p>
      )}
    </Layout>
  );
}
