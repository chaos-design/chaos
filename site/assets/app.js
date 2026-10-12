(() => {
  const templates = (window.CHAOS_TEMPLATES ?? []).slice();
  const state = {
    pm: 'pnpm',
    dir: 'my-app',
    templateId: templates.length > 0 ? templates[0].id : null,
    filter: '',
    cursor: 0,
  };

  const catalogEl = document.getElementById('catalog');
  const emptyEl = document.getElementById('empty-state');
  const commandEl = document.getElementById('command-text');
  const copyBtn = document.getElementById('copy-btn');
  const dirInput = document.getElementById('dir-input');
  const filterInput = document.getElementById('filter-input');
  const pmListEl = document.getElementById('pm-list');
  const selectValueEl = document.getElementById('select-value');
  const selectSymbolEl = document.getElementById('select-symbol');

  const PM_ORDER = ['npm', 'pnpm', 'yarn', 'bun'];

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const findTemplate = (id) => templates.find((item) => item.id === id) ?? null;

  // Command forms mirror the usage documented in the repository README:
  // npm 7+, yarn and pnpm need `--` before flags passed to the created
  // package; bun passes them directly.
  const buildCommand = (pm, dir, alias) => {
    const name = dir.trim() || 'chaos-project';

    if (pm === 'npm') {
      return `npm create chaos@latest ${name} -- --template ${alias}`;
    }

    return `${pm} create chaos ${name} --template ${alias}`;
  };

  const matchesFilter = (template, keyword) => {
    if (!keyword) {
      return true;
    }

    const haystack = [
      template.title,
      template.alias,
      template.id,
      template.categoryLabel,
      template.description,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(keyword);
  };

  const colorClass = (template) => `c-${template.color || 'default'}`;

  // The choice description the CLI prints under the active row:
  // `${categoryDisplay} | ${name}${alias}` with alias = ` | ${showName}`.
  const choiceMeta = (template) => {
    const alias =
      template.alias && template.alias !== template.id
        ? ` | ${template.alias}`
        : '';
    return `${template.categoryLabel} | ${template.id}${alias}`;
  };

  const renderCommand = () => {
    const template = findTemplate(state.templateId);

    if (!template) {
      commandEl.textContent = '';
      copyBtn.disabled = true;
      return;
    }

    copyBtn.disabled = false;
    commandEl.textContent = buildCommand(state.pm, state.dir, template.alias);
  };

  // prompts' select head flips to its "done" state once a value exists:
  // green ✔ instead of the magenta ?, and the submitted title after ›.
  const renderSelectHead = () => {
    const template = findTemplate(state.templateId);

    if (!template) {
      selectSymbolEl.textContent = '?';
      selectSymbolEl.classList.remove('is-done');
      selectValueEl.className = 'p-hint';
      selectValueEl.textContent = '- Pick a template below.';
      return;
    }

    selectSymbolEl.textContent = '✔';
    selectSymbolEl.classList.add('is-done');
    selectValueEl.className = colorClass(template);
    selectValueEl.textContent = template.title;
  };

  const renderPm = () => {
    pmListEl.innerHTML = PM_ORDER.map(
      (pm) =>
        `<button type="button" class="tok${pm === state.pm ? ' is-active' : ''}"` +
        ` data-pm="${pm}" aria-pressed="${pm === state.pm ? 'true' : 'false'}"` +
        `>${pm}</button>`,
    ).join('');
  };

  const renderCatalog = () => {
    const keyword = state.filter.trim().toLowerCase();
    const visible = templates.filter((template) =>
      matchesFilter(template, keyword),
    );

    // Keep the cursor on the submitted template when it survives the filter.
    const selected = visible.findIndex((item) => item.id === state.templateId);
    state.cursor =
      selected >= 0
        ? selected
        : Math.min(state.cursor, Math.max(0, visible.length - 1));

    catalogEl.innerHTML = visible
      .map((template, index) => {
        const isCursor = index === state.cursor;
        const row =
          `<button type="button" class="row${isCursor ? ' is-cursor' : ''}"` +
          ` data-index="${index}" data-id="${escapeHtml(template.id)}"` +
          ` aria-pressed="${template.id === state.templateId ? 'true' : 'false'}">` +
          `<span class="row-prefix" aria-hidden="true">${isCursor ? '❯' : ''}</span>` +
          `<span class="row-title ${colorClass(template)}">${escapeHtml(template.title)}</span>` +
          '</button>';

        // prompts shows the description only under the active row; every row
        // carries one here so moving the cursor is a pure class toggle.
        const desc =
          `<div class="row-desc"${isCursor ? '' : ' hidden'}>` +
          `<span class="d-meta">${escapeHtml(choiceMeta(template))}</span>` +
          escapeHtml(template.description) +
          '</div>';

        return row + desc;
      })
      .join('');

    emptyEl.hidden = visible.length > 0;

    if (!emptyEl.hidden) {
      emptyEl.textContent = `- No templates match "${state.filter.trim()}".`;
    }

    renderSelectHead();
  };

  // Moves the ❯ pointer without rebuilding the list: prompts redraws in
  // place, and this keeps focus and scroll position stable while hovering.
  const setCursor = (index) => {
    const rows = catalogEl.querySelectorAll('.row');

    if (rows.length === 0) {
      return;
    }

    const next = Math.min(Math.max(index, 0), rows.length - 1);

    if (next === state.cursor) {
      return;
    }

    const previous = rows[state.cursor];

    if (previous) {
      previous.classList.remove('is-cursor');
      previous.querySelector('.row-prefix').textContent = '';
      const previousDesc = previous.nextElementSibling;

      if (previousDesc?.classList.contains('row-desc')) {
        previousDesc.hidden = true;
      }
    }

    const target = rows[next];
    target.classList.add('is-cursor');
    target.querySelector('.row-prefix').textContent = '❯';
    const targetDesc = target.nextElementSibling;

    if (targetDesc?.classList.contains('row-desc')) {
      targetDesc.hidden = false;
    }

    state.cursor = next;
  };

  const submitTemplate = (index) => {
    const rows = catalogEl.querySelectorAll('.row');
    const row = rows[index];

    if (!row) {
      return;
    }

    state.templateId = row.dataset.id;

    for (const item of rows) {
      item.setAttribute('aria-pressed', item === row ? 'true' : 'false');
    }

    renderCommand();
    renderSelectHead();
  };

  const resetCopyButton = () => {
    copyBtn.classList.remove('is-copied');
    copyBtn.textContent = '复制命令';
  };

  // Fallback for non-secure contexts (file://, plain http) where the async
  // clipboard API is unavailable.
  const legacyCopy = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    let ok = false;

    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }

    document.body.removeChild(textarea);
    return ok;
  };

  const copyCommand = () => {
    const text = commandEl.textContent;

    if (!text) {
      return;
    }

    const done = (ok) => {
      copyBtn.classList.add('is-copied');
      copyBtn.textContent = ok ? '已复制 ✓' : '已选中，按 Ctrl/⌘ + C';
      window.setTimeout(resetCopyButton, 1600);

      if (!ok) {
        const range = document.createRange();
        range.selectNodeContents(commandEl);

        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => done(true),
        () => done(legacyCopy(text)),
      );
      return;
    }

    done(legacyCopy(text));
  };

  catalogEl.addEventListener('mouseover', (event) => {
    const row = event.target.closest('.row');

    if (row) {
      setCursor(Number(row.dataset.index));
    }
  });

  catalogEl.addEventListener('click', (event) => {
    const row = event.target.closest('.row');

    if (row) {
      submitTemplate(Number(row.dataset.index));
    }
  });

  pmListEl.addEventListener('click', (event) => {
    const button = event.target.closest('.tok');

    if (button && button.dataset.pm !== state.pm) {
      state.pm = button.dataset.pm;
      renderPm();
      renderCommand();
    }
  });

  dirInput.addEventListener('input', () => {
    state.dir = dirInput.value;
    renderCommand();
  });

  filterInput.addEventListener('input', () => {
    state.filter = filterInput.value;
    renderCatalog();
  });

  // Arrow-keys move the pointer and Enter submits, like the real prompt.
  // Skipped while typing in an input so text editing keeps its keys.
  document.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLInputElement) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setCursor(state.cursor + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setCursor(state.cursor - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      submitTemplate(state.cursor);
    }
  });

  copyBtn.addEventListener('click', copyCommand);

  renderPm();
  renderCatalog();
  renderCommand();
})();
