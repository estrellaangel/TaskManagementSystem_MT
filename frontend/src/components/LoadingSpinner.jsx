// frontend/src/components/LoadingSpinner.jsx
import React from 'react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="spinner-root" role="status" aria-live="polite">
      <div className="spinner" />
      <div className="spinner-message">{message}</div>
    </div>
  );
}