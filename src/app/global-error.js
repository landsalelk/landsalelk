'use client'

import { useEffect } from 'react';
import { logErrorToGitHub } from '@/actions/log-issue';

export default function GlobalError({
  error,
  reset,
}) {
  
  useEffect(() => {
    // Attempt to log the error to GitHub automatically
    const logIssue = async () => {
      await logErrorToGitHub(
        error.message,
        error.stack || 'No stack trace available',
        window.location.pathname
      );
    };
    
    if (error) {
        logIssue();
    }
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
          <h2>Something went wrong!</h2>
          <p>Our team has been notified via GitHub Issues.</p>
          <button
            onClick={() => reset()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
