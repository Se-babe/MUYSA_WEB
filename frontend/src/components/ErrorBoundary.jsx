import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="loading-screen" style={{ minHeight: '60vh' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Something went wrong</h2>
          <p className="empty-text" style={{ padding: '0 1rem 1rem' }}>
            Please refresh the page. If the problem continues, contact the MUYSA admin.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
