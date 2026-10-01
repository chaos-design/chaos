import { appConfig } from '@/config/app-config';

export type FloatingBallPosition = 'bottom-left' | 'bottom-right';
export type ThemeMode = 'dark' | 'light' | 'system';
export type ToolbarMode = 'popup' | 'sidepanel';

export interface ExtensionSettings {
  floatingBallEnabled: boolean;
  floatingBallPosition: FloatingBallPosition;
  floatingBallSize: number;
  floatingBallVerticalRatio: number;
  popupHeight: number;
  popupWidth: number;
  theme: ThemeMode;
  toolbarModes: ToolbarMode[];
}

export const defaultExtensionSettings: ExtensionSettings = {
  floatingBallEnabled: appConfig.surfaces.floatingBall.defaultEnabled,
  floatingBallPosition: appConfig.surfaces.floatingBall
    .defaultPosition as FloatingBallPosition,
  floatingBallSize: appConfig.surfaces.floatingBall.defaultSize,
  floatingBallVerticalRatio:
    appConfig.surfaces.floatingBall.defaultVerticalRatio,
  popupHeight: appConfig.surfaces.popup.defaultHeight,
  popupWidth: appConfig.surfaces.popup.defaultWidth,
  theme: 'dark',
  toolbarModes: [
    appConfig.surfaces.sidePanel.defaultToolbarMode ? 'sidepanel' : 'popup',
  ],
};

const storageKey = 'scaffold:extension-settings';

type StoredExtensionSettings = Partial<ExtensionSettings> & {
  toolbarMode?: ToolbarMode;
};

function normalizeSettings(value?: StoredExtensionSettings): ExtensionSettings {
  const {
    toolbarMode: legacyToolbarMode,
    toolbarModes: storedToolbarModes,
    ...storedSettings
  } = value ?? {};
  const verticalRatio = storedSettings.floatingBallVerticalRatio;
  const theme = storedSettings.theme;
  const selectedToolbarModes = Array.isArray(storedToolbarModes)
    ? new Set(storedToolbarModes)
    : new Set<ToolbarMode>();
  const toolbarModes = (['popup', 'sidepanel'] satisfies ToolbarMode[]).filter(
    (mode) => selectedToolbarModes.has(mode),
  );

  if (
    toolbarModes.length === 0 &&
    (legacyToolbarMode === 'popup' || legacyToolbarMode === 'sidepanel')
  ) {
    toolbarModes.push(legacyToolbarMode);
  }

  return {
    ...defaultExtensionSettings,
    ...storedSettings,
    floatingBallVerticalRatio:
      typeof verticalRatio === 'number' && Number.isFinite(verticalRatio)
        ? Math.min(1, Math.max(0, verticalRatio))
        : defaultExtensionSettings.floatingBallVerticalRatio,
    theme:
      theme === 'dark' || theme === 'light' || theme === 'system'
        ? theme
        : defaultExtensionSettings.theme,
    toolbarModes:
      toolbarModes.length > 0
        ? toolbarModes
        : defaultExtensionSettings.toolbarModes,
  };
}

export async function getExtensionSettings() {
  const stored = await browser.storage.local.get(storageKey);
  return normalizeSettings(
    stored[storageKey] as StoredExtensionSettings | undefined,
  );
}

export async function setExtensionSettings(settings: ExtensionSettings) {
  await browser.storage.local.set({ [storageKey]: settings });
}

export async function resetExtensionSettings() {
  await browser.storage.local.remove(storageKey);
}

export function watchExtensionSettings(
  listener: (settings: ExtensionSettings) => void,
) {
  const handleChange = (
    changes: Record<string, { newValue?: unknown }>,
    areaName: string,
  ) => {
    if (areaName !== 'local' || !changes[storageKey]) {
      return;
    }

    listener(
      normalizeSettings(
        changes[storageKey].newValue as StoredExtensionSettings | undefined,
      ),
    );
  };

  browser.storage.onChanged.addListener(handleChange);
  return () => browser.storage.onChanged.removeListener(handleChange);
}
