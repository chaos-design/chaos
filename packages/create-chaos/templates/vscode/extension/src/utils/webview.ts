import * as vscode from 'vscode';

export const getWebviewOptions = (
  extensionUri: vscode.Uri,
): vscode.WebviewOptions => {
  return {
    enableScripts: true,
    localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'webview-ui/dist')],
  };
};
