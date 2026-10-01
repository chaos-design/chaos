export interface WebTemplateOption {
  alias: string;
  category: string;
  categoryLabel: string;
  categoryLabelZh: string;
  description: string;
  descriptionZh: string;
  id: string;
  title: string;
  titleZh: string;
}

interface WebAppOptions {
  defaultPackageManager: string;
  displayCwd: string;
  initialPackageName: string;
  initialTargetDir: string;
  templates: WebTemplateOption[];
  token: string;
}

function serializeForHtml(value: unknown) {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026');
}

export function getWebAppHtml(options: WebAppOptions) {
  const bootData = serializeForHtml(options);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <title>Chaos Composer</title>
    <style>
      :root {
        --ink: #171714;
        --muted: #686861;
        --paper: #f4f3ed;
        --panel: #fbfaf6;
        --line: #d4d2c8;
        --line-strong: #9d9b91;
        --accent: #f15335;
        --accent-dark: #c93820;
        --yellow: #f3c544;
        --cyan: #5fc7c7;
        --green: #78b979;
        --blue: #638cc8;
        --purple: #aa83bd;
        --shadow: 0 12px 32px rgba(24, 24, 20, 0.08);
        --pane-padding-inline: clamp(18px, 2.5vw, 34px);
        --scrollbar-size: 10px;
        --mono: "SFMono-Regular", "Cascadia Code", "Liberation Mono", monospace;
        --sans: "Avenir Next", Avenir, "Segoe UI", sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      html {
        background: var(--paper);
        color: var(--ink);
        font-family: var(--sans);
      }

      body {
        min-width: 0;
        margin: 0;
        background:
          linear-gradient(rgba(23, 23, 20, 0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(23, 23, 20, 0.035) 1px, transparent 1px),
          var(--paper);
        background-size: 24px 24px;
      }

      button,
      input {
        font: inherit;
      }

      button {
        color: inherit;
      }

      button:focus-visible,
      input:focus-visible,
      .module-results:focus-visible {
        outline: 3px solid rgba(95, 199, 199, 0.55);
        outline-offset: 2px;
      }

      .app-header {
        position: sticky;
        z-index: 20;
        top: 0;
        display: flex;
        min-height: 64px;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 10px clamp(16px, 3vw, 36px);
        border-bottom: 1px solid var(--ink);
        background: rgba(244, 243, 237, 0.96);
      }

      .brand {
        display: flex;
        min-width: 0;
        align-items: center;
        gap: 12px;
      }

      .brand-mark {
        display: grid;
        width: 38px;
        height: 38px;
        flex: 0 0 auto;
        place-items: center;
        border: 1px solid var(--ink);
        background: var(--yellow);
        box-shadow: 3px 3px 0 var(--ink);
        font-family: var(--mono);
        font-size: 13px;
        font-weight: 800;
      }

      .brand-name {
        overflow: hidden;
        font-size: 17px;
        font-weight: 750;
        letter-spacing: 0;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .brand-subtitle {
        margin-top: 1px;
        color: var(--muted);
        font-family: var(--mono);
        font-size: 10px;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      .header-actions {
        display: flex;
        flex: 0 0 auto;
        align-items: center;
        gap: 18px;
      }

      .language-control {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .language-button {
        min-width: 48px;
        height: 30px;
        margin-left: -1px;
        border: 1px solid var(--line-strong);
        background: var(--panel);
        cursor: pointer;
        font-family: var(--mono);
        font-size: 10px;
      }

      .language-button:first-child {
        margin-left: 0;
        border-radius: 4px 0 0 4px;
      }

      .language-button:last-child {
        border-radius: 0 4px 4px 0;
      }

      .language-button[aria-pressed="true"] {
        position: relative;
        z-index: 1;
        border-color: var(--ink);
        background: var(--yellow);
        font-weight: 800;
      }

      .local-status {
        display: flex;
        flex: 0 0 auto;
        align-items: center;
        gap: 8px;
        font-family: var(--mono);
        font-size: 11px;
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--green);
        box-shadow: 0 0 0 3px rgba(120, 185, 121, 0.2);
      }

      .workspace {
        display: grid;
        width: min(1480px, 100%);
        min-height: calc(100dvh - 64px);
        margin: 0 auto;
        grid-template-columns: minmax(230px, 0.72fr) minmax(420px, 1.7fr) minmax(300px, 0.9fr);
      }

      .pane {
        min-width: 0;
        padding: 28px var(--pane-padding-inline);
        background: rgba(251, 250, 246, 0.76);
      }

      .setup-pane,
      .module-pane {
        border-right: 1px solid var(--line);
      }

      .setup-pane,
      .preview-pane {
        align-self: start;
      }

      .eyebrow {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0 0 20px;
        color: var(--muted);
        font-family: var(--mono);
        font-size: 10px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .eyebrow-index {
        display: grid;
        width: 24px;
        height: 24px;
        place-items: center;
        border: 1px solid var(--line-strong);
        background: var(--panel);
        color: var(--ink);
      }

      .field {
        margin-bottom: 20px;
      }

      .field label,
      .control-label {
        display: block;
        margin-bottom: 7px;
        font-size: 12px;
        font-weight: 700;
      }

      .text-input,
      .search-input {
        width: 100%;
        min-width: 0;
        height: 42px;
        border: 1px solid var(--line-strong);
        border-radius: 4px;
        background: var(--panel);
        color: var(--ink);
        padding: 0 12px;
        box-shadow: inset 0 1px 0 #fff;
      }

      .text-input:hover,
      .search-input:hover {
        border-color: var(--ink);
      }

      .field-hint,
      .field-error {
        min-height: 16px;
        margin: 6px 0 0;
        color: var(--muted);
        font-family: var(--mono);
        font-size: 10px;
        line-height: 1.5;
        overflow-wrap: anywhere;
      }

      .field-hint {
        color: var(--muted);
      }

      .field-error {
        color: var(--accent-dark);
      }

      .cwd {
        margin-top: 28px;
        padding-top: 18px;
        border-top: 1px solid var(--line);
      }

      .cwd-value {
        color: var(--muted);
        font-family: var(--mono);
        font-size: 10px;
        line-height: 1.6;
        overflow-wrap: anywhere;
      }

      .module-heading {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 20px;
      }

      h1 {
        max-width: 520px;
        margin: 0;
        font-size: clamp(25px, 3vw, 36px);
        font-weight: 720;
        letter-spacing: 0;
        line-height: 1.05;
      }

      .module-count {
        flex: 0 0 auto;
        color: var(--muted);
        font-family: var(--mono);
        font-size: 11px;
      }

      .search-wrap {
        position: relative;
        margin-bottom: 13px;
      }

      .search-wrap svg {
        position: absolute;
        top: 13px;
        left: 12px;
        width: 16px;
        height: 16px;
        color: var(--muted);
        pointer-events: none;
      }

      .search-input {
        padding-left: 38px;
      }

      .filter-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 20px;
      }

      .filter-button,
      .manager-button {
        min-height: 30px;
        border: 1px solid var(--line);
        border-radius: 4px;
        background: var(--panel);
        padding: 5px 9px;
        cursor: pointer;
        font-family: var(--mono);
        font-size: 10px;
      }

      .filter-button:hover,
      .manager-button:hover {
        border-color: var(--ink);
      }

      .filter-button[aria-pressed="true"] {
        border-color: var(--ink);
        background: var(--ink);
        color: #fff;
      }

      .module-grid {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .module-card {
        position: relative;
        display: flex;
        min-width: 0;
        min-height: 142px;
        flex-direction: column;
        align-items: stretch;
        justify-content: space-between;
        overflow: hidden;
        border: 1px solid var(--line);
        border-radius: 6px;
        background: var(--panel);
        padding: 16px;
        text-align: left;
        cursor: pointer;
        transition:
          transform 140ms ease,
          border-color 140ms ease,
          box-shadow 140ms ease;
      }

      .module-card::before {
        position: absolute;
        top: 0;
        right: 0;
        width: 42px;
        height: 7px;
        background: var(--module-color);
        content: "";
      }

      .module-card:hover {
        border-color: var(--ink);
        transform: translateY(-2px);
      }

      .module-card[aria-checked="true"] {
        border-color: var(--ink);
        box-shadow: 4px 4px 0 var(--ink);
      }

      .module-card-top {
        display: flex;
        min-width: 0;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      .module-title {
        min-width: 0;
        font-size: 15px;
        font-weight: 750;
        line-height: 1.25;
        overflow-wrap: anywhere;
      }

      .radio-mark {
        display: grid;
        width: 18px;
        height: 18px;
        flex: 0 0 auto;
        place-items: center;
        border: 1px solid var(--line-strong);
        border-radius: 50%;
      }

      .module-card[aria-checked="true"] .radio-mark {
        border: 5px solid var(--ink);
        background: var(--module-color);
      }

      .module-description {
        margin: 9px 0 14px;
        color: var(--muted);
        font-size: 12px;
        line-height: 1.45;
      }

      .module-meta {
        display: flex;
        min-width: 0;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-family: var(--mono);
        font-size: 9px;
        text-transform: uppercase;
      }

      .module-alias {
        overflow: hidden;
        color: var(--muted);
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .empty-state {
        display: none;
        padding: 48px 16px;
        border: 1px dashed var(--line-strong);
        color: var(--muted);
        text-align: center;
      }

      .preview-pane {
        position: sticky;
        top: 64px;
      }

      .selected-summary {
        margin-bottom: 24px;
        padding-bottom: 20px;
        border-bottom: 1px solid var(--line);
      }

      .selected-category {
        margin-bottom: 6px;
        color: var(--accent-dark);
        font-family: var(--mono);
        font-size: 10px;
        text-transform: uppercase;
      }

      .selected-title {
        font-size: 22px;
        font-weight: 750;
        line-height: 1.2;
        overflow-wrap: anywhere;
      }

      .selected-description {
        margin: 8px 0 0;
        color: var(--muted);
        font-size: 12px;
        line-height: 1.55;
      }

      .manager-control {
        display: grid;
        margin-bottom: 18px;
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .manager-button {
        border-radius: 0;
        margin-left: -1px;
        padding-inline: 4px;
      }

      .manager-button:first-child {
        margin-left: 0;
        border-radius: 4px 0 0 4px;
      }

      .manager-button:last-child {
        border-radius: 0 4px 4px 0;
      }

      .manager-button[aria-pressed="true"] {
        position: relative;
        z-index: 1;
        border-color: var(--ink);
        background: var(--yellow);
        font-weight: 800;
      }

      .command-block {
        position: relative;
        min-height: 94px;
        margin-bottom: 18px;
        border: 1px solid #30302b;
        border-radius: 5px;
        background: #20201d;
        color: #f6f4e9;
        padding: 17px 44px 17px 16px;
      }

      .command-label {
        margin-bottom: 10px;
        color: #a8a79f;
        font-family: var(--mono);
        font-size: 9px;
        text-transform: uppercase;
      }

      .command-value {
        margin: 0;
        font-family: var(--mono);
        font-size: 11px;
        line-height: 1.6;
        overflow-wrap: anywhere;
        white-space: pre-wrap;
      }

      .icon-button {
        display: grid;
        width: 32px;
        height: 32px;
        place-items: center;
        border: 1px solid currentColor;
        border-radius: 4px;
        background: transparent;
        cursor: pointer;
      }

      .icon-button svg,
      .primary-button svg,
      .secondary-button svg,
      .notice svg {
        width: 16px;
        height: 16px;
      }

      .copy-button {
        position: absolute;
        top: 12px;
        right: 12px;
        color: #cbc9bf;
      }

      .copy-button:hover {
        color: #fff;
      }

      .primary-button,
      .secondary-button {
        display: inline-flex;
        min-height: 44px;
        align-items: center;
        justify-content: center;
        gap: 9px;
        border: 1px solid var(--ink);
        border-radius: 4px;
        padding: 0 16px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 800;
      }

      .primary-button {
        width: 100%;
        background: var(--accent);
        box-shadow: 3px 3px 0 var(--ink);
        color: #fff;
      }

      .primary-button:hover:not(:disabled) {
        background: var(--accent-dark);
        transform: translate(1px, 1px);
        box-shadow: 2px 2px 0 var(--ink);
      }

      .primary-button:disabled {
        cursor: wait;
        opacity: 0.62;
      }

      .secondary-button {
        background: var(--panel);
      }

      .button-spinner {
        display: none;
        width: 15px;
        height: 15px;
        border: 2px solid rgba(255, 255, 255, 0.45);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 750ms linear infinite;
      }

      .primary-button[data-loading="true"] .button-spinner {
        display: block;
      }

      .primary-button[data-loading="true"] .button-icon {
        display: none;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .result {
        display: none;
        margin-top: 22px;
        border-top: 1px solid var(--line);
        padding-top: 20px;
      }

      .result[data-visible="true"] {
        display: block;
        animation: result-in 220ms ease both;
      }

      @keyframes result-in {
        from {
          opacity: 0;
          transform: translateY(5px);
        }
      }

      .result-status {
        display: flex;
        align-items: center;
        gap: 9px;
        margin-bottom: 12px;
        color: #28713b;
        font-size: 12px;
        font-weight: 800;
      }

      .result-status-mark {
        display: grid;
        width: 20px;
        height: 20px;
        place-items: center;
        border-radius: 50%;
        background: var(--green);
        color: #fff;
      }

      .result-path {
        color: var(--muted);
        font-family: var(--mono);
        font-size: 10px;
        line-height: 1.55;
        overflow-wrap: anywhere;
      }

      .next-steps {
        margin-top: 12px;
        border-left: 3px solid var(--green);
        background: rgba(120, 185, 121, 0.1);
        padding: 10px 12px;
      }

      .next-command {
        display: block;
        color: var(--ink);
        font-family: var(--mono);
        font-size: 10px;
        line-height: 1.7;
        overflow-wrap: anywhere;
      }

      .notice {
        display: flex;
        gap: 10px;
        margin-top: 16px;
        border: 1px solid #d3a82e;
        border-radius: 4px;
        background: #fff5cd;
        padding: 12px;
        color: #624b0c;
        font-size: 11px;
        line-height: 1.5;
      }

      .notice svg {
        flex: 0 0 auto;
        margin-top: 1px;
      }

      .modal-backdrop {
        position: fixed;
        z-index: 50;
        inset: 0;
        display: none;
        align-items: center;
        justify-content: center;
        background: rgba(23, 23, 20, 0.45);
        padding: 18px;
      }

      .modal-backdrop[data-open="true"] {
        display: flex;
      }

      .modal {
        width: min(430px, 100%);
        border: 1px solid var(--ink);
        border-radius: 6px;
        background: var(--panel);
        box-shadow: 7px 7px 0 var(--ink);
        padding: 24px;
      }

      .modal h2 {
        margin: 0 0 8px;
        font-size: 20px;
        letter-spacing: 0;
      }

      .modal p {
        margin: 0;
        color: var(--muted);
        font-size: 12px;
        line-height: 1.6;
      }

      .modal-path {
        display: block;
        margin-top: 10px;
        font-family: var(--mono);
        font-size: 10px;
        overflow-wrap: anywhere;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 9px;
        margin-top: 22px;
      }

      .danger-button {
        background: var(--accent);
        color: #fff;
      }

      .toast {
        position: fixed;
        z-index: 70;
        right: 18px;
        bottom: 18px;
        max-width: min(360px, calc(100vw - 36px));
        border: 1px solid var(--ink);
        border-radius: 4px;
        background: var(--ink);
        color: #fff;
        padding: 11px 14px;
        box-shadow: var(--shadow);
        font-family: var(--mono);
        font-size: 10px;
        opacity: 0;
        pointer-events: none;
        transform: translateY(8px);
        transition: 160ms ease;
      }

      .toast[data-visible="true"] {
        opacity: 1;
        transform: translateY(0);
      }

      @media (min-width: 1081px) {
        html,
        body {
          height: 100%;
          overflow: hidden;
        }

        .app-header {
          position: relative;
        }

        .workspace {
          height: calc(100dvh - 64px);
          min-height: 0;
          overflow: hidden;
        }

        .pane {
          height: 100%;
          min-height: 0;
          overflow: hidden;
        }

        .module-pane {
          display: flex;
          flex-direction: column;
        }

        .module-results {
          min-height: 0;
          flex: 1;
          margin-right: calc(var(--pane-padding-inline) * -1);
          overflow-y: auto;
          overscroll-behavior: contain;
          padding-right: calc(
            var(--pane-padding-inline) - var(--native-scrollbar-width, 0px)
          );
          padding-bottom: 4px;
          scrollbar-width: thin;
        }

        .module-results::-webkit-scrollbar {
          width: var(--scrollbar-size);
        }

        .module-results::-webkit-scrollbar-track {
          background: transparent;
        }

        .module-results::-webkit-scrollbar-thumb {
          border: 2px solid transparent;
          border-radius: 999px;
          background: var(--line-strong);
          background-clip: content-box;
        }

        .setup-pane,
        .preview-pane {
          position: static;
          align-self: stretch;
        }
      }

      @media (max-width: 1080px) {
        .workspace {
          grid-template-columns: 260px minmax(0, 1fr);
        }

        .module-pane {
          border-right: 0;
        }

        .preview-pane {
          position: static;
          grid-column: 1 / -1;
          border-top: 1px solid var(--line);
        }
      }

      @media (max-width: 700px) {
        .app-header {
          min-height: 58px;
        }

        .brand-subtitle,
        .local-status span:last-child {
          display: none;
        }

        .header-actions {
          gap: 12px;
        }

        .language-button {
          min-width: 42px;
        }

        .workspace {
          display: block;
          min-height: calc(100dvh - 58px);
        }

        .pane {
          padding: 24px 16px;
        }

        .setup-pane,
        .module-pane {
          border-right: 0;
          border-bottom: 1px solid var(--line);
        }

        .module-heading {
          align-items: flex-start;
          flex-direction: column;
        }

        .module-grid {
          grid-template-columns: 1fr;
        }

        .preview-pane {
          position: static;
        }

        .modal-actions {
          align-items: stretch;
          flex-direction: column-reverse;
        }

        .modal-actions button {
          width: 100%;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          scroll-behavior: auto !important;
          transition-duration: 0.01ms !important;
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
        }
      }
    </style>
  </head>
  <body>
    <svg aria-hidden="true" width="0" height="0" style="position:absolute">
      <symbol id="icon-search" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.3-4.3"></path>
      </symbol>
      <symbol id="icon-copy" viewBox="0 0 24 24">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
      </symbol>
      <symbol id="icon-terminal" viewBox="0 0 24 24">
        <polyline points="4 17 10 11 4 5"></polyline>
        <line x1="12" x2="20" y1="19" y2="19"></line>
      </symbol>
      <symbol id="icon-alert" viewBox="0 0 24 24">
        <path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14a2 2 0 0 0 1.7 3h16a2 2 0 0 0 1.7-3Z"></path>
        <path d="M12 9v4"></path>
        <path d="M12 17h.01"></path>
      </symbol>
      <symbol id="icon-arrow" viewBox="0 0 24 24">
        <path d="M5 12h14"></path>
        <path d="m13 6 6 6-6 6"></path>
      </symbol>
    </svg>

    <header class="app-header">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">C//</div>
        <div>
          <div class="brand-name">Chaos Composer</div>
          <div class="brand-subtitle" data-i18n="brandSubtitle">Visual template assembly</div>
        </div>
      </div>
      <div class="header-actions">
        <div class="language-control" id="language-control" aria-label="Language">
          <button class="language-button" type="button" data-language="zh">中文</button>
          <button class="language-button" type="button" data-language="en">EN</button>
        </div>
        <div class="local-status" id="local-status" title="This session only accepts local requests">
          <span class="status-dot"></span>
          <span data-i18n="localSession">Local session</span>
        </div>
      </div>
    </header>

    <main class="workspace">
      <aside class="pane setup-pane" aria-labelledby="project-settings-title">
        <p class="eyebrow" id="project-settings-title">
          <span class="eyebrow-index">01</span>
          <span data-i18n="projectSettings">Project settings</span>
        </p>

        <div class="field">
          <label for="target-dir" data-i18n="outputDirectory">Output directory (relative)</label>
          <input
            class="text-input"
            id="target-dir"
            name="target-dir"
            autocomplete="off"
            spellcheck="false"
          />
          <p class="field-hint" id="target-path-preview"></p>
          <p class="field-error" id="target-error" aria-live="polite"></p>
        </div>

        <div class="field">
          <label for="package-name" data-i18n="packageName">Package name</label>
          <input
            class="text-input"
            id="package-name"
            name="package-name"
            autocomplete="off"
            spellcheck="false"
          />
          <p class="field-error" id="package-error" aria-live="polite"></p>
        </div>

        <div class="cwd">
          <div class="control-label" data-i18n="workingDirectory">Command working directory</div>
          <div class="cwd-value" id="cwd"></div>
        </div>
      </aside>

      <section class="pane module-pane" aria-labelledby="module-title">
        <p class="eyebrow">
          <span class="eyebrow-index">02</span>
          <span data-i18n="templateModule">Template module</span>
        </p>
        <div class="module-heading">
          <h1 id="module-title" data-i18n="chooseFoundation">Choose your foundation.</h1>
          <span class="module-count" id="module-count"></span>
        </div>

        <div class="search-wrap">
          <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
            <use href="#icon-search"></use>
          </svg>
          <input
            class="search-input"
            id="template-search"
            type="search"
            placeholder="Search templates"
            data-i18n-placeholder="searchTemplates"
            autocomplete="off"
          />
        </div>
        <div class="filter-row" id="filter-row" aria-label="Template categories"></div>
        <div class="module-results" id="module-results" tabindex="0" aria-label="Template results">
          <div class="module-grid" id="module-grid" role="radiogroup" aria-label="Templates"></div>
          <div class="empty-state" id="empty-state" data-i18n="emptyState">No templates match this filter.</div>
        </div>
      </section>

      <aside class="pane preview-pane" aria-labelledby="command-title">
        <p class="eyebrow">
          <span class="eyebrow-index">03</span>
          <span data-i18n="buildCommand">Build command</span>
        </p>

        <div class="selected-summary">
          <div class="selected-category" id="selected-category"></div>
          <div class="selected-title" id="selected-title"></div>
          <p class="selected-description" id="selected-description"></p>
        </div>

        <div class="control-label" data-i18n="packageManager">Package manager</div>
        <div class="manager-control" id="manager-control" aria-label="Package manager"></div>

        <div class="command-block">
          <div class="command-label" id="command-title" data-i18n="equivalentCommand">Equivalent command</div>
          <pre class="command-value" id="command-value"></pre>
          <button class="icon-button copy-button" id="copy-button" type="button" title="Copy command" aria-label="Copy command">
            <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <use href="#icon-copy"></use>
            </svg>
          </button>
        </div>

        <button class="primary-button" id="generate-button" type="button">
          <span class="button-spinner" aria-hidden="true"></span>
          <svg class="button-icon" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
            <use href="#icon-terminal"></use>
          </svg>
          <span id="generate-label" data-i18n="generateTemplate">Generate template</span>
        </button>

        <div class="notice">
          <svg aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
            <use href="#icon-alert"></use>
          </svg>
          <span data-i18n="localWriteNotice">Files are written locally under the command working directory. Dependencies are not installed automatically.</span>
        </div>

        <div class="result" id="result" aria-live="polite">
          <div class="result-status">
            <span class="result-status-mark">✓</span>
            <span data-i18n="templateGenerated">Template generated</span>
          </div>
          <div class="result-path" id="result-path"></div>
          <div class="next-steps" id="next-steps"></div>
        </div>
      </aside>
    </main>

    <div class="modal-backdrop" id="overwrite-modal" data-open="false">
      <div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="overwrite-title" aria-describedby="overwrite-description">
        <h2 id="overwrite-title" data-i18n="replaceTitle">Replace existing files?</h2>
        <p id="overwrite-description" data-i18n="replaceDescription">The output directory is not empty. Its current contents will be removed before the template is generated.</p>
        <span class="modal-path" id="overwrite-path"></span>
        <div class="modal-actions">
          <button class="secondary-button" id="cancel-overwrite" type="button" data-i18n="cancel">Cancel</button>
          <button class="secondary-button danger-button" id="confirm-overwrite" type="button">
            <span data-i18n="replaceContents">Replace contents</span>
          </button>
        </div>
      </div>
    </div>

    <div class="toast" id="toast" role="status" aria-live="polite"></div>
    <script type="application/json" id="boot-data">${bootData}</script>
    <script nonce="${options.token}">
      (function () {
        'use strict';

        var boot = JSON.parse(document.getElementById('boot-data').textContent);
        var colors = {
          browser: 'var(--green)',
          react: 'var(--cyan)',
          library: 'var(--purple)',
          webpack: 'var(--yellow)',
          vscode: 'var(--blue)',
          repository: 'var(--green)',
          docs: 'var(--accent)'
        };
        var managers = ['pnpm', 'npm', 'yarn', 'bun'];
        var translations = {
          en: {
            all: 'All',
            brandSubtitle: 'Visual template assembly',
            buildCommand: 'Build command',
            cancel: 'Cancel',
            chooseFoundation: 'Choose your foundation.',
            clipboardUnavailable: 'Clipboard access was unavailable.',
            commandCopied: 'Command copied.',
            copyCommand: 'Copy command',
            createAt: 'Creates at:',
            documentTitle: 'Chaos Composer',
            emptyState: 'No templates match this filter.',
            equivalentCommand: 'Equivalent command',
            generateTemplate: 'Generate template',
            generating: 'Generating...',
            generationFailed: 'Template generation failed.',
            invalidPackage: 'Use a valid lowercase npm package name.',
            invalidTarget: 'The output directory is invalid.',
            languageLabel: 'Language',
            localSession: 'Local session',
            localSessionTitle: 'This session only accepts local requests',
            localWriteNotice: 'Files are written locally under the command working directory. Dependencies are not installed automatically.',
            moduleSingular: 'module',
            modulePlural: 'modules',
            outputDirectory: 'Output directory (relative)',
            packageManager: 'Package manager',
            packageManagerLabel: 'Package manager',
            packageName: 'Package name',
            packageNameInvalid: 'Use a valid lowercase npm package name.',
            packageNameRequired: 'Enter a package name.',
            parentNotAllowed: 'Parent directory segments are not allowed.',
            projectSettings: 'Project settings',
            replaceContents: 'Replace contents',
            replaceDescription: 'The output directory is not empty. Its current contents will be removed before the template is generated.',
            replaceTitle: 'Replace existing files?',
            searchTemplates: 'Search templates',
            templateCategories: 'Template categories',
            templateGenerated: 'Template generated',
            templateModule: 'Template module',
            templateResults: 'Template results',
            templates: 'Templates',
            templatesGenerated: 'Template files generated.',
            targetCharacters: 'Use letters, numbers, dots, dashes, underscores, or slashes.',
            targetChildOnly: 'Use a child directory of the command working directory.',
            targetRequired: 'Enter an output directory.',
            workingDirectory: 'Command working directory'
          },
          zh: {
            all: '全部',
            brandSubtitle: '模板可视化生成器',
            buildCommand: '生成命令',
            cancel: '取消',
            chooseFoundation: '选择项目模板',
            clipboardUnavailable: '无法访问剪贴板。',
            commandCopied: '命令已复制。',
            copyCommand: '复制命令',
            createAt: '创建位置：',
            documentTitle: 'Chaos 模板生成器',
            emptyState: '没有匹配的模板。',
            equivalentCommand: '等效命令',
            generateTemplate: '生成模板',
            generating: '正在生成...',
            generationFailed: '模板生成失败。',
            invalidPackage: '请输入有效的小写 npm 包名。',
            invalidTarget: '输出目录无效。',
            languageLabel: '语言',
            localSession: '本地会话',
            localSessionTitle: '当前会话仅接受本机请求',
            localWriteNotice: '文件将写入执行命令所在目录下，依赖不会自动安装。',
            moduleSingular: '个模板',
            modulePlural: '个模板',
            outputDirectory: '输出目录（相对路径）',
            packageManager: '包管理器',
            packageManagerLabel: '包管理器',
            packageName: '包名',
            packageNameInvalid: '请输入有效的小写 npm 包名。',
            packageNameRequired: '请输入包名。',
            parentNotAllowed: '输出目录不能包含上级目录标记。',
            projectSettings: '项目设置',
            replaceContents: '清空并替换',
            replaceDescription: '输出目录不为空，生成模板前将移除其中的现有内容。',
            replaceTitle: '替换现有文件？',
            searchTemplates: '搜索模板',
            templateCategories: '模板分类',
            templateGenerated: '模板生成成功',
            templateModule: '模板模块',
            templateResults: '模板结果',
            templates: '模板',
            templatesGenerated: '模板文件已生成。',
            targetCharacters: '仅支持字母、数字、点、短横线、下划线和斜杠。',
            targetChildOnly: '请填写执行命令目录下的子目录。',
            targetRequired: '请输入输出目录。',
            workingDirectory: '执行命令目录'
          }
        };
        var apiErrorKeys = {
          INVALID_PACKAGE_NAME: 'invalidPackage',
          INVALID_TARGET: 'invalidTarget',
          GENERATION_FAILED: 'generationFailed'
        };

        function getInitialLanguage() {
          try {
            var storedLanguage = window.localStorage.getItem('chaos-composer-language');
            if (storedLanguage === 'zh' || storedLanguage === 'en') {
              return storedLanguage;
            }
          } catch (_error) {
            // Storage can be unavailable in restricted browser contexts.
          }

          return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
        }

        var state = {
          category: 'all',
          generating: false,
          language: getInitialLanguage(),
          packageManager: boot.defaultPackageManager,
          packageTouched: false,
          query: '',
          selected: boot.templates[0]
        };
        var targetInput = document.getElementById('target-dir');
        var packageInput = document.getElementById('package-name');
        var targetError = document.getElementById('target-error');
        var packageError = document.getElementById('package-error');
        var moduleGrid = document.getElementById('module-grid');
        var moduleResults = document.getElementById('module-results');
        var emptyState = document.getElementById('empty-state');
        var filterRow = document.getElementById('filter-row');
        var managerControl = document.getElementById('manager-control');
        var generateButton = document.getElementById('generate-button');
        var generateLabel = document.getElementById('generate-label');
        var languageControl = document.getElementById('language-control');
        var overwriteModal = document.getElementById('overwrite-modal');
        var targetPathPreview = document.getElementById('target-path-preview');
        var toastTimer;

        targetInput.value = boot.initialTargetDir;
        packageInput.value = boot.initialPackageName;
        document.getElementById('cwd').textContent = boot.displayCwd;

        function t(key) {
          return translations[state.language][key] || translations.en[key] || key;
        }

        function getLocalizedValue(template, field) {
          if (state.language === 'zh') {
            return template[field + 'Zh'] || template[field];
          }
          return template[field];
        }

        function updateScrollbarMetrics() {
          var scrollbarWidth = moduleResults.offsetWidth - moduleResults.clientWidth;
          moduleResults.style.setProperty(
            '--native-scrollbar-width',
            scrollbarWidth + 'px'
          );
        }

        function updateTargetPath() {
          var target = targetInput.value.trim();
          var child = target.replace(/[\\\\/]+/g, '/');
          var displayCwd = boot.displayCwd.replace(/\\/+$/, '');
          targetPathPreview.textContent =
            t('createAt') + ' ' + displayCwd + '/' + (child || '...');
        }

        function renderStaticCopy() {
          document.documentElement.lang = state.language === 'zh' ? 'zh-CN' : 'en';
          document.title = t('documentTitle');
          document.querySelectorAll('[data-i18n]').forEach(function (node) {
            node.textContent = t(node.getAttribute('data-i18n'));
          });
          document.querySelectorAll('[data-i18n-placeholder]').forEach(function (node) {
            node.setAttribute('placeholder', t(node.getAttribute('data-i18n-placeholder')));
          });
          languageControl.setAttribute('aria-label', t('languageLabel'));
          document.getElementById('local-status').setAttribute('title', t('localSessionTitle'));
          document.getElementById('filter-row').setAttribute('aria-label', t('templateCategories'));
          document.getElementById('module-grid').setAttribute('aria-label', t('templates'));
          document.getElementById('module-results').setAttribute('aria-label', t('templateResults'));
          managerControl.setAttribute('aria-label', t('packageManagerLabel'));
          document.getElementById('copy-button').setAttribute('title', t('copyCommand'));
          document.getElementById('copy-button').setAttribute('aria-label', t('copyCommand'));
          document.querySelectorAll('[data-language]').forEach(function (button) {
            button.setAttribute(
              'aria-pressed',
              String(button.getAttribute('data-language') === state.language)
            );
          });
          updateTargetPath();
        }

        function setLanguage(language) {
          state.language = language === 'zh' ? 'zh' : 'en';
          try {
            window.localStorage.setItem('chaos-composer-language', state.language);
          } catch (_error) {
            // The language still applies for the current session.
          }
          renderStaticCopy();
          renderFilters();
          renderTemplates();
          renderPreview();
          validate();
          setGenerating(state.generating);
        }

        function getIcon(id) {
          var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
          svg.setAttribute('aria-hidden', 'true');
          svg.setAttribute('fill', 'none');
          svg.setAttribute('stroke', 'currentColor');
          svg.setAttribute('stroke-linecap', 'round');
          svg.setAttribute('stroke-linejoin', 'round');
          svg.setAttribute('stroke-width', '2');
          use.setAttribute('href', '#' + id);
          svg.appendChild(use);
          return svg;
        }

        function toPackageName(value) {
          var parts = value.split('/').filter(Boolean);
          return (parts[parts.length - 1] || 'chaos-project')
            .trim()
            .toLowerCase()
            .replace(/\\s+/g, '-')
            .replace(/^[._]/, '')
            .replace(/[^a-z\\d\\-~]+/g, '-');
        }

        function validate() {
          var target = targetInput.value.trim();
          var packageName = packageInput.value.trim();
          var targetMessage = '';
          var packageMessage = '';
          var segments = target.split('/');

          if (!target) {
            targetMessage = t('targetRequired');
          } else if (target === '.' || target.charAt(0) === '/' || /^[A-Za-z]:/.test(target)) {
            targetMessage = t('targetChildOnly');
          } else if (segments.indexOf('..') !== -1) {
            targetMessage = t('parentNotAllowed');
          } else if (!/^[a-zA-Z0-9._\\-/]+$/.test(target)) {
            targetMessage = t('targetCharacters');
          }

          if (!packageName) {
            packageMessage = t('packageNameRequired');
          } else if (!/^(?:@[a-z\\d\\-*~][a-z\\d\\-*._~]*\\/)?[a-z\\d\\-~][a-z\\d\\-._~]*$/.test(packageName)) {
            packageMessage = t('packageNameInvalid');
          }

          targetError.textContent = targetMessage;
          packageError.textContent = packageMessage;
          return !targetMessage && !packageMessage;
        }

        function getCommand() {
          var target = targetInput.value.trim() || 'chaos-project';
          var template = state.selected.alias || state.selected.id;

          if (state.packageManager === 'npm') {
            return 'npm create chaos@latest ' + target + ' -- --template ' + template;
          }
          if (state.packageManager === 'yarn') {
            return 'yarn create chaos ' + target + ' --template ' + template;
          }
          if (state.packageManager === 'bun') {
            return 'bun create chaos@latest ' + target + ' --template ' + template;
          }
          return 'pnpm create chaos@latest ' + target + ' --template ' + template;
        }

        function filteredTemplates() {
          var query = state.query.toLowerCase();
          return boot.templates.filter(function (template) {
            var matchesCategory =
              state.category === 'all' || template.category === state.category;
            var haystack = [
              template.title,
              template.titleZh,
              template.description,
              template.descriptionZh,
              template.categoryLabel,
              template.categoryLabelZh,
              template.alias,
              template.id
            ].join(' ').toLowerCase();
            return matchesCategory && haystack.indexOf(query) !== -1;
          });
        }

        function renderFilters() {
          var categories = [];
          boot.templates.forEach(function (template) {
            if (!categories.some(function (item) { return item.id === template.category; })) {
              categories.push({
                id: template.category,
                label: template.categoryLabel,
                labelZh: template.categoryLabelZh
              });
            }
          });
          categories.unshift({ id: 'all', label: 'All', labelZh: '全部' });
          filterRow.replaceChildren();
          categories.forEach(function (category) {
            var button = document.createElement('button');
            button.className = 'filter-button';
            button.type = 'button';
            button.textContent =
              state.language === 'zh' ? category.labelZh : category.label;
            button.setAttribute('aria-pressed', String(state.category === category.id));
            button.addEventListener('click', function () {
              state.category = category.id;
              renderFilters();
              renderTemplates();
            });
            filterRow.appendChild(button);
          });
        }

        function renderTemplates() {
          var templates = filteredTemplates();
          moduleGrid.replaceChildren();
          emptyState.style.display = templates.length ? 'none' : 'block';
          document.getElementById('module-count').textContent =
            state.language === 'zh'
              ? templates.length + ' ' + t('modulePlural')
              : templates.length + ' ' +
                (templates.length === 1 ? t('moduleSingular') : t('modulePlural'));

          templates.forEach(function (template) {
            var card = document.createElement('button');
            var top = document.createElement('span');
            var title = document.createElement('span');
            var radio = document.createElement('span');
            var description = document.createElement('span');
            var meta = document.createElement('span');
            var category = document.createElement('span');
            var alias = document.createElement('span');

            card.className = 'module-card';
            card.type = 'button';
            card.setAttribute('role', 'radio');
            card.setAttribute('aria-checked', String(state.selected.id === template.id));
            card.style.setProperty('--module-color', colors[template.category] || 'var(--cyan)');
            top.className = 'module-card-top';
            title.className = 'module-title';
            title.textContent = getLocalizedValue(template, 'title');
            radio.className = 'radio-mark';
            radio.setAttribute('aria-hidden', 'true');
            description.className = 'module-description';
            description.textContent = getLocalizedValue(template, 'description');
            meta.className = 'module-meta';
            category.textContent = getLocalizedValue(template, 'categoryLabel');
            alias.className = 'module-alias';
            alias.textContent = '--template ' + template.alias;

            top.append(title, radio);
            meta.append(category, alias);
            card.append(top, description, meta);
            card.addEventListener('click', function () {
              state.selected = template;
              renderTemplates();
              renderPreview();
            });
            moduleGrid.appendChild(card);
          });
          window.requestAnimationFrame(updateScrollbarMetrics);
        }

        function renderManagers() {
          managerControl.replaceChildren();
          managers.forEach(function (manager) {
            var button = document.createElement('button');
            button.className = 'manager-button';
            button.type = 'button';
            button.textContent = manager;
            button.setAttribute('aria-pressed', String(state.packageManager === manager));
            button.addEventListener('click', function () {
              state.packageManager = manager;
              renderManagers();
              renderPreview();
            });
            managerControl.appendChild(button);
          });
        }

        function renderPreview() {
          document.getElementById('selected-category').textContent =
            getLocalizedValue(state.selected, 'categoryLabel');
          document.getElementById('selected-title').textContent =
            getLocalizedValue(state.selected, 'title');
          document.getElementById('selected-description').textContent =
            getLocalizedValue(state.selected, 'description');
          document.getElementById('command-value').textContent = getCommand();
        }

        function showToast(message) {
          var toast = document.getElementById('toast');
          window.clearTimeout(toastTimer);
          toast.textContent = message;
          toast.setAttribute('data-visible', 'true');
          toastTimer = window.setTimeout(function () {
            toast.setAttribute('data-visible', 'false');
          }, 2600);
        }

        function setGenerating(generating) {
          state.generating = generating;
          generateButton.disabled = generating;
          generateButton.setAttribute('data-loading', String(generating));
          generateLabel.textContent =
            generating ? t('generating') : t('generateTemplate');
        }

        function showResult(data) {
          var result = document.getElementById('result');
          var nextSteps = document.getElementById('next-steps');
          document.getElementById('result-path').textContent = data.root;
          nextSteps.replaceChildren();
          data.nextCommands.forEach(function (command) {
            var line = document.createElement('code');
            line.className = 'next-command';
            line.textContent = command;
            nextSteps.appendChild(line);
          });
          result.setAttribute('data-visible', 'true');
          result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        async function generate(overwrite) {
          if (state.generating || !validate()) {
            return;
          }

          setGenerating(true);
          document.getElementById('result').setAttribute('data-visible', 'false');

          try {
            var response = await fetch('/api/generate', {
              method: 'POST',
              headers: {
                'content-type': 'application/json',
                'x-chaos-token': boot.token
              },
              body: JSON.stringify({
                overwrite: overwrite,
                packageManager: state.packageManager,
                packageName: packageInput.value.trim(),
                targetDir: targetInput.value.trim(),
                template: state.selected.id
              })
            });
            var data = await response.json();

            if (response.status === 409 && data.code === 'TARGET_NOT_EMPTY') {
              document.getElementById('overwrite-path').textContent = data.root;
              overwriteModal.setAttribute('data-open', 'true');
              document.getElementById('confirm-overwrite').focus();
              return;
            }

            if (!response.ok) {
              var errorKey = apiErrorKeys[data.code];
              throw new Error(errorKey ? t(errorKey) : data.message || t('generationFailed'));
            }

            showResult(data);
            showToast(t('templatesGenerated'));
          } catch (error) {
            showToast(error instanceof Error ? error.message : t('generationFailed'));
          } finally {
            setGenerating(false);
          }
        }

        document.getElementById('template-search').addEventListener('input', function (event) {
          state.query = event.target.value.trim();
          renderTemplates();
        });

        targetInput.addEventListener('input', function () {
          if (!state.packageTouched) {
            packageInput.value = toPackageName(targetInput.value);
          }
          updateTargetPath();
          validate();
          renderPreview();
        });

        packageInput.addEventListener('input', function () {
          state.packageTouched = true;
          validate();
        });

        generateButton.addEventListener('click', function () {
          generate(false);
        });

        document.getElementById('copy-button').addEventListener('click', async function () {
          try {
            await navigator.clipboard.writeText(getCommand());
            showToast(t('commandCopied'));
          } catch (_error) {
            showToast(t('clipboardUnavailable'));
          }
        });

        languageControl.addEventListener('click', function (event) {
          var button = event.target.closest('[data-language]');
          if (button) {
            setLanguage(button.getAttribute('data-language'));
          }
        });

        document.getElementById('cancel-overwrite').addEventListener('click', function () {
          overwriteModal.setAttribute('data-open', 'false');
          generateButton.focus();
        });

        document.getElementById('confirm-overwrite').addEventListener('click', function () {
          overwriteModal.setAttribute('data-open', 'false');
          generate(true);
        });

        overwriteModal.addEventListener('click', function (event) {
          if (event.target === overwriteModal) {
            overwriteModal.setAttribute('data-open', 'false');
          }
        });

        document.addEventListener('keydown', function (event) {
          if (event.key === 'Escape' && overwriteModal.getAttribute('data-open') === 'true') {
            overwriteModal.setAttribute('data-open', 'false');
            generateButton.focus();
          }
        });

        window.addEventListener('resize', updateScrollbarMetrics);
        renderStaticCopy();
        renderFilters();
        renderTemplates();
        renderManagers();
        renderPreview();
        validate();
      })();
    </script>
  </body>
</html>`;
}
