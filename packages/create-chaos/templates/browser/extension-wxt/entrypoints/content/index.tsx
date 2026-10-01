import React from 'react';
import ReactDOM from 'react-dom/client';

import { FloatingBall } from '@/components/floating-ball';
import { appConfig } from '@/config/app-config';
import '@/styles/globals.css';

export default defineContentScript({
  cssInjectionMode: 'ui',
  matches: appConfig.contentScript.matches,
  runAt: 'document_idle',

  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      alignment: 'top-left',
      anchor: 'body',
      isolateEvents: true,
      name: 'browser-extension-scaffold',
      position: 'overlay',
      zIndex: 2_147_483_647,
      onMount(container) {
        const root = ReactDOM.createRoot(container);
        root.render(
          <React.StrictMode>
            <FloatingBall />
          </React.StrictMode>,
        );
        return root;
      },
      onRemove(root) {
        root?.unmount();
      },
    });

    ui.mount();
  },
});
