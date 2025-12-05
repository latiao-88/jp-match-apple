import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global error trap for mobile debugging
window.addEventListener('error', (event) => {
  console.error("Global Error Caught:", event.error);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = '<div style="color:red;padding:20px;">Error: Root element not found.</div>';
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (e) {
  document.body.innerHTML += `<div style="color:red;padding:20px;background:white;">React Mount Error: ${e}</div>`;
  console.error("React Mount Error:", e);
}