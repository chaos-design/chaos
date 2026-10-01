import type {
  ExtensionMessage,
  ExtensionMessageResponse,
} from '@/lib/extension-messages';
import {
  getExtensionSettings,
  watchExtensionSettings,
} from '@/lib/extension-settings';

interface FirefoxSidebarAction {
  open(): Promise<void>;
}

function getFirefoxSidebarAction() {
  return (
    browser as typeof browser & {
      sidebarAction?: FirefoxSidebarAction;
    }
  ).sidebarAction;
}

function getToolbarAction() {
  return browser.action ?? browser.browserAction;
}

async function syncToolbarEntrances() {
  const settings = await getExtensionSettings();
  const usesPopup = settings.toolbarModes.includes('popup');
  const usesSidePanel = settings.toolbarModes.includes('sidepanel');

  await getToolbarAction().setPopup({
    popup: usesPopup ? 'popup.html' : '',
  });

  if (browser.sidePanel?.setPanelBehavior) {
    await browser.sidePanel.setPanelBehavior({
      openPanelOnActionClick: usesSidePanel && !usesPopup,
    });
  }
}

async function openSidePanel(windowId?: number) {
  if (windowId !== undefined && browser.sidePanel?.open) {
    await browser.sidePanel.open({ windowId });
    return;
  }

  const firefoxSidebarAction = getFirefoxSidebarAction();
  if (firefoxSidebarAction?.open) {
    await firefoxSidebarAction.open();
    return;
  }

  throw new Error('Side panel API is unavailable.');
}

export default defineBackground(() => {
  void syncToolbarEntrances();

  browser.runtime.onInstalled.addListener(() => {
    void syncToolbarEntrances();
  });

  watchExtensionSettings(() => {
    void syncToolbarEntrances();
  });

  getToolbarAction().onClicked.addListener((tab) => {
    void getExtensionSettings().then(async (settings) => {
      if (
        settings.toolbarModes.includes('popup') ||
        !settings.toolbarModes.includes('sidepanel')
      ) {
        return;
      }

      await openSidePanel(tab.windowId);
    });
  });

  browser.runtime.onMessage.addListener(
    async (
      message: ExtensionMessage,
      sender,
    ): Promise<ExtensionMessageResponse | undefined> => {
      if (message.type === 'scaffold:open-options') {
        await browser.runtime.openOptionsPage();
        return { ok: true };
      }

      if (message.type === 'scaffold:open-side-panel') {
        let windowId = sender.tab?.windowId;
        if (windowId === undefined) {
          const [activeTab] = await browser.tabs.query({
            active: true,
            currentWindow: true,
          });
          windowId = activeTab?.windowId;
        }

        try {
          await openSidePanel(windowId);
          return { ok: true };
        } catch {
          return {
            error: '当前浏览器不支持侧边栏，或未授予权限。',
            ok: false,
          };
        }
      }

      return undefined;
    },
  );
});
