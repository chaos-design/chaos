import {
  ArrowUpRightIcon,
  PanelRightOpenIcon,
  Settings2Icon,
  SparklesIcon,
} from 'lucide-react';
import { useState } from 'react';

import { appConfig } from '@/config/app-config';
import { useExtensionSettings } from '@/hooks/use-extension-settings';
import { useExtensionTheme } from '@/hooks/use-extension-theme';
import type {
  ExtensionMessage,
  ExtensionMessageResponse,
} from '@/lib/extension-messages';
import { cn } from '@/lib/utils';

interface ExtensionSurfaceProps {
  surface: 'popup' | 'sidepanel';
}

async function sendMessage(message: ExtensionMessage) {
  return browser.runtime.sendMessage(
    message,
  ) as Promise<ExtensionMessageResponse>;
}

export function ExtensionSurface({ surface }: ExtensionSurfaceProps) {
  const { settings } = useExtensionSettings();
  const resolvedTheme = useExtensionTheme(settings.theme, true);
  const [error, setError] = useState('');
  const isPopup = surface === 'popup';

  const openSidePanel = async () => {
    const response = await sendMessage({
      type: 'scaffold:open-side-panel',
    });
    setError(response?.ok ? '' : (response?.error ?? '无法打开侧边栏。'));
    if (response?.ok && isPopup) {
      window.close();
    }
  };

  const openOptions = async () => {
    await sendMessage({ type: 'scaffold:open-options' });
    if (isPopup) {
      window.close();
    }
  };

  return (
    <main
      className={cn(
        'surface-root',
        isPopup ? 'surface-popup' : 'min-h-screen',
        resolvedTheme === 'dark' && 'dark',
        resolvedTheme === 'light' && 'light',
      )}
      style={
        isPopup
          ? {
              height: settings.popupHeight,
              width: settings.popupWidth,
            }
          : undefined
      }
    >
      <header className="surface-header">
        <div className="brand-lockup">
          <span className="brand-icon">
            <SparklesIcon aria-hidden="true" />
          </span>
          <span className="surface-action-copy">
            <strong>{appConfig.shortName}</strong>
            <small>{isPopup ? 'POPUP' : 'SIDE PANEL'}</small>
          </span>
        </div>
        <span className="status-badge">
          <span aria-hidden="true" />
          Ready
        </span>
      </header>

      <section className="surface-intro">
        <p className="surface-kicker">EXTENSION WORKSPACE</p>
        <h1>{appConfig.name}</h1>
        <p>{appConfig.description}</p>
      </section>

      <section className="surface-actions" aria-label="快捷操作">
        <button type="button" onClick={openSidePanel}>
          <PanelRightOpenIcon aria-hidden="true" />
          <span className="surface-action-copy">
            <strong>打开侧边栏</strong>
            <small>在当前窗口持续显示</small>
          </span>
          <ArrowUpRightIcon aria-hidden="true" />
        </button>
        <button type="button" onClick={openOptions}>
          <Settings2Icon aria-hidden="true" />
          <span>
            <strong>显示设置</strong>
            <small>管理入口与窗口尺寸</small>
          </span>
          <ArrowUpRightIcon aria-hidden="true" />
        </button>
      </section>

      {error ? (
        <p className="surface-error" role="alert">
          {error}
        </p>
      ) : null}

      <footer className="surface-footer">
        <span>
          {settings.toolbarModes
            .map((mode) => (mode === 'popup' ? 'Popup' : 'Side panel'))
            .join(' + ')}
        </span>
        <span>Local settings</span>
      </footer>
    </main>
  );
}
