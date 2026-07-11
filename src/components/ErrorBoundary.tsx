import React from 'react';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Необработанная ошибка приложения:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#12141c',
            color: '#eef0f4',
            fontFamily: 'system-ui, sans-serif',
            padding: 24,
          }}
        >
          <div style={{ maxWidth: 520, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ marginBottom: 12 }}>Что-то пошло не так</h2>
            <p style={{ color: '#9aa1b2', marginBottom: 16, fontSize: 14 }}>
              Приложение столкнулось с ошибкой. Скопируйте текст ниже и отправьте разработчику.
            </p>
            <pre
              style={{
                background: '#20232f',
                border: '1px solid #2c3040',
                borderRadius: 8,
                padding: 12,
                fontSize: 12,
                textAlign: 'left',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 16,
                padding: '10px 20px',
                background: '#d4a94f',
                color: '#1a1408',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Перезагрузить приложение
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
