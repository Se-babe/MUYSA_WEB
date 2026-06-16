export default function ExecutiveRegisterTable({ executives, title = 'Executive Register' }) {
  if (!executives.length) return null;

  const showContact = executives.some((e) => e.phone || e.email);

  return (
    <div className="executives-table-section">
      <h2>{title}</h2>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Post</th>
              <th>Course</th>
              {showContact && <th>Contact</th>}
            </tr>
          </thead>
          <tbody>
            {executives.map((exec) => (
              <tr key={exec.id}>
                <td className="member-name">{exec.full_name}</td>
                <td><span className="tag tag-gold">{exec.post}</span></td>
                <td className="member-course">{exec.course || '—'}</td>
                {showContact && (
                  <td className="executive-contact-cell">
                    {exec.phone && <span>{exec.phone}</span>}
                    {exec.email && <span>{exec.email}</span>}
                    {!exec.phone && !exec.email && '—'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
