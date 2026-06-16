import Navbar from './Navbar';
import { ASSOCIATION_NAME, ASSOCIATION_SHORT, APP_NAME, APP_TAGLINE, COPYRIGHT } from '../constants/branding';

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">{children}</main>
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-brand-icon">M</span>
            <div>
              <strong>{APP_NAME}</strong>
              <span>{ASSOCIATION_NAME}</span>
            </div>
          </div>
          <p className="footer-tagline">{APP_TAGLINE}</p>
        </div>
        <p className="footer-copy">{COPYRIGHT}</p>
      </footer>
    </div>
  );
}
