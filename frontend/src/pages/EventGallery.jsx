import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { FiX, FiArrowLeft } from 'react-icons/fi';

export default function EventGallery() {
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    fetch('/images/events/gallery/manifest.json')
      .then((r) => (r.ok ? r.json() : null))
      .then(setAlbum)
      .catch(() => setAlbum(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const photos = album?.photos || [];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <Link to="/events" className="gallery-back-link"><FiArrowLeft /> Events</Link>
          <h1>{album?.album || 'Event Photo Gallery'}</h1>
          <p>{album?.description || 'MUYSA community event photos'}</p>
        </div>
        {photos.length > 0 && (
          <span className="member-count-badge">{photos.length} photos</span>
        )}
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : photos.length === 0 ? (
        <p className="empty-text">
          Gallery not published yet. An admin needs to run{' '}
          <code>python3 scripts/build-event-gallery.py</code> and deploy the site.
        </p>
      ) : (
        <div className="photo-gallery-grid">
          {photos.map((photo, index) => (
            <button
              key={photo.src}
              type="button"
              className="photo-gallery-item"
              onClick={() => setLightbox({ ...photo, index })}
            >
              <img src={photo.src} alt={photo.name || `Event photo ${index + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div className="photo-lightbox" role="dialog" aria-modal="true" onClick={() => setLightbox(null)}>
          <button type="button" className="photo-lightbox-close" aria-label="Close" onClick={() => setLightbox(null)}>
            <FiX />
          </button>
          <figure className="photo-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.src} alt={lightbox.name} />
            <figcaption>{lightbox.index + 1} / {photos.length}</figcaption>
          </figure>
        </div>
      )}
    </Layout>
  );
}
