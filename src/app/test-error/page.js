'use client';

export default function TestErrorPage() {
  const triggerError = () => {
    throw new Error('This is a test error to verify GitHub Logger');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Test Error Logger</h1>
      <button
        onClick={triggerError}
        style={{
          padding: '10px 20px',
          backgroundColor: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Trigger Runtime Error
      </button>
    </div>
  );
}
