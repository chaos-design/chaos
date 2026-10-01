import React from 'react';
import ReactDOM from 'react-dom/client';

import { ExtensionSurface } from '@/components/extension-surface';
import { appConfig } from '@/config/app-config';
import '@/styles/globals.css';

document.title = `${appConfig.documentTitle} - Side Panel`;

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element was not found.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ExtensionSurface surface="sidepanel" />
  </React.StrictMode>,
);
