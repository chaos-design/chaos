import * as vscode from 'vscode';
import { Commands } from '../commands';
import { getWebviewOptions } from '../utils/webview';

import getWebview from './webview';

export default class Create {
  public static currentPanel: Create | undefined;

  readonly _panel: vscode.WebviewPanel;
  readonly _extensionUri: vscode.Uri;
  _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    this._panel.iconPath = vscode.Uri.joinPath(
      extensionUri,
      'static',
      'images',
      'logo-sm.png',
    );

    // Set the webview's initial html content
    this._getWebviewContent();

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      this.onDidReceiveMessage,
      null,
      this._disposables,
    );
  }

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (Create.currentPanel) {
      Create.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      Commands.CREATE,
      'Create',
      column || vscode.ViewColumn.One,
      getWebviewOptions(extensionUri),
    );

    Create.currentPanel = new Create(panel, extensionUri);
  }

  public onDidReceiveMessage = (_message: any) => {};

  public dispose() {
    Create.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();

      if (disposable) {
        disposable.dispose();
      }
    }
  }

  _getWebviewContent() {
    switch (this._panel.viewColumn) {
      case vscode.ViewColumn.One:
      case vscode.ViewColumn.Two:
      case vscode.ViewColumn.Three:
        this._panel.webview.html = getWebview({
          webview: this._panel.webview,
          extensionUri: this._extensionUri,
        });
    }
  }
}
