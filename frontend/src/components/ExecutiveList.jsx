export default function ExecutiveList({ executives, archive = false }) {
  if (!executives.length) {
    return (
      <p className="empty-text">
        {archive ? 'No records for this academic year.' : 'Executive list will be published soon.'}
      </p>
    );
  }

  return (
    <div className={`executives-grid ${archive ? 'executives-grid-archive' : ''}`}>
      {executives.map((exec) => (
        <article key={exec.id} className={`executive-card ${archive ? 'executive-card-archive' : ''}`}>
          <div className="executive-avatar">
            <span>{exec.full_name?.charAt(0) || '?'}</span>
          </div>
          <h3>{exec.full_name}</h3>
          <p className="executive-post">{exec.post}</p>
          {exec.course && <p className="executive-course">{exec.course}</p>}
          {exec.academic_year && (
            <span className="tag tag-outline">{exec.academic_year}</span>
          )}
          {(exec.phone || exec.email) && (
            <div className="executive-contact">
              {exec.phone && <span>{exec.phone}</span>}
              {exec.email && <span>{exec.email}</span>}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
