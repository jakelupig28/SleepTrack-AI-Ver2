import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical Error: Could not find root element to mount to");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("SleepTrack AI: React 19 mounted successfully.");
  } catch (error) {
    console.error("Mounting Error:", error);
    rootElement.innerHTML = `<div style="padding: 20px; color: red;">Failed to load the app. Check console for details.</div>`;
  }
}