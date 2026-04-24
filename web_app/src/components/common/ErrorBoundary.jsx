import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          retry: this.handleRetry,
        });
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <span className="material-symbols-rounded error-boundary-icon">error</span>
            <h2>Đã xảy ra lỗi</h2>
            <p>{this.state.error?.message || 'Có lỗi không mong muốn xảy ra'}</p>
            <div className="error-boundary-actions">
              <button className="btn-primary" onClick={this.handleRetry}>
                Thử lại
              </button>
              <button className="btn-secondary" onClick={() => window.location.reload()}>
                Tải lại trang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}