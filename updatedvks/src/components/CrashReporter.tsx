import { Component, type ErrorInfo, type ReactNode } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class CrashReporter extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    
    try {
      // Log to Firestore global errors collection
      await addDoc(collection(db, 'system_errors'), {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userId: auth.currentUser?.uid || 'anonymous',
        userEmail: auth.currentUser?.email || 'N/A',
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        status: 'new'
      });
    } catch (e) {
      console.error("Failed to log error to Firestore:", e);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '10px' }}>Something went wrong</h1>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>The app encountered a crash. We've reported it to our team.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              backgroundColor: '#a855f7', 
              color: 'white', 
              padding: '10px 24px', 
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Refresh App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default CrashReporter;
