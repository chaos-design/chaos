export type ExtensionMessage =
  | { type: 'scaffold:open-options' }
  | { type: 'scaffold:open-side-panel' };

export interface ExtensionMessageResponse {
  error?: string;
  ok: boolean;
}
