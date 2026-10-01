import React from 'react';
import ReactDOM from 'react-dom/client';

import { SettingsPage } from '@/components/settings-page';
import { appConfig } from '@/config/app-config';
import '@/styles/globals.css';
import '@/styles/settings.css';

document.title = `${appConfig.documentTitle} - Settings`;

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element was not found.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <SettingsPage />
  </React.StrictMode>,
);
