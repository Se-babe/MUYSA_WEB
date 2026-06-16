export default function MemberTable({ members, showRole = true, onMessage }) {
  if (!members.length) {
    return <p className="empty-text">No members found.</p>;
  }

  return (
    <>
      <div className="members-mobile-list">
        {members.map((m, i) => (
          <article key={m.id || m.user_id} className="member-mobile-card">
            <div className="member-mobile-card-main">
              <span className="member-mobile-index">{i + 1}</span>
              <div>
                <h3 className="member-name">{m.full_name}</h3>
                <p className="member-course">{m.course || '—'}</p>
                {showRole && (
                  <span className={`tag tag-${m.role === 'alumni' ? 'gold' : 'green'}`}>
                    {m.role === 'alumni' ? 'Alumni' : 'Student'}
                  </span>
                )}
              </div>
            </div>
            {onMessage && (
              <button
                type="button"
                className="btn btn-outline btn-sm btn-block-mobile"
                onClick={() => onMessage(m.id || m.user_id)}
              >
                Message
              </button>
            )}
          </article>
        ))}
      </div>

      <div className="table-wrapper members-table-desktop">
        <table className="data-table members-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Full Name</th>
              <th>Course</th>
              {showRole && <th>Member Type</th>}
              {onMessage && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={m.id || m.user_id}>
                <td>{i + 1}</td>
                <td className="member-name">{m.full_name}</td>
                <td className="member-course">{m.course || '—'}</td>
                {showRole && (
                  <td>
                    <span className={`tag tag-${m.role === 'alumni' ? 'gold' : 'green'}`}>
                      {m.role === 'alumni' ? 'Alumni' : 'Student'}
                    </span>
                  </td>
                )}
                {onMessage && (
                  <td>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => onMessage(m.id || m.user_id)}>
                      Message
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
