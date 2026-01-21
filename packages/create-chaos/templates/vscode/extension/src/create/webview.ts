import { Uri, Webview } from 'vscode';
import { getNonce } from '../utils/nonce';
import { getUri } from '../utils/url';

export default ({
  webview,
  extensionUri,
}: {
  webview: Webview;
  extensionUri: Uri;
}) => {
  const stylesUri = getUri(webview, extensionUri, [
    'webview-ui',
    'dist',
    'css',
    'index.css',
  ]);

  const scriptUri = getUri(webview, extensionUri, [
    'webview-ui',
    'dist',
    'js',
    'index.js',
  ]);

  const nonce = getNonce();

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title></title>
        <link rel="icon" href="favicon.ico" type="image/x-icon" />
        <link rel="stylesheet" type="text/css" href="${stylesUri}">
      </head>
      <body>
        <div id="root"></div>
        <script>

          if (!window._vscode) {
            window._vscode = acquireVsCodeApi();
          }

        </script>
        <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
      </body>
    </html>
  `;
};
