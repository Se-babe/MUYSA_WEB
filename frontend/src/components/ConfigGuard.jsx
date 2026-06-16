const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
];

export const isFirebaseConfigured = () =>
  required.every((key) => {
    const val = import.meta.env[key];
    return val && val !== 'your_api_key' && !val.startsWith('your-');
  });

export default function ConfigGuard({ children }) {
  if (isFirebaseConfigured()) return children;

  return (
    <div className="config-error-page">
      <div className="config-error-card">
        <span className="auth-brand-icon">M</span>
        <h1>Setup Required</h1>
        <p>
          Firebase is not configured. Copy <code>frontend/.env.example</code> to{' '}
          <code>frontend/.env</code> and add your Firebase project credentials before members can use MUYSA Connect.
        </p>
        <ol>
          <li>Open the Firebase Console for project <strong>muysa-6962c</strong></li>
          <li>Enable Email/Password authentication</li>
          <li>Copy the web app config into <code>frontend/.env</code></li>
          <li>Run <code>npm run deploy:rules</code> from the project root</li>
          <li>Restart the dev server</li>
        </ol>
      </div>
    </div>
  );
}
