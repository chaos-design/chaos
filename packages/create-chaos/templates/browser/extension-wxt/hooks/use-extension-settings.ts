import { useEffect, useState } from 'react';

import {
  defaultExtensionSettings,
  type ExtensionSettings,
  getExtensionSettings,
  setExtensionSettings,
  watchExtensionSettings,
} from '@/lib/extension-settings';

export function useExtensionSettings() {
  const [settings, setSettingsState] = useState<ExtensionSettings>(
    defaultExtensionSettings,
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isActive = true;

    void getExtensionSettings().then((storedSettings) => {
      if (isActive) {
        setSettingsState(storedSettings);
        setIsReady(true);
      }
    });

    const unwatch = watchExtensionSettings((nextSettings) => {
      setSettingsState(nextSettings);
      setIsReady(true);
    });

    return () => {
      isActive = false;
      unwatch();
    };
  }, []);

  const updateSettings = (
    update:
      | Partial<ExtensionSettings>
      | ((current: ExtensionSettings) => Partial<ExtensionSettings>),
  ) => {
    setSettingsState((current) => {
      const patch = typeof update === 'function' ? update(current) : update;
      const nextSettings = { ...current, ...patch };
      void setExtensionSettings(nextSettings);
      return nextSettings;
    });
  };

  return {
    isReady,
    settings,
    updateSettings,
  };
}
