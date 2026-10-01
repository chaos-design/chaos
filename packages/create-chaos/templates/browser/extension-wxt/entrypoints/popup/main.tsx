import React from 'react';
import ReactDOM from 'react-dom/client';

import { appConfig } from '@/config/app-config';
import '@/styles/globals.css';

import { App } from './app';
import './style.css';

document.title = appConfig.documentTitle;

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element was not found.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
