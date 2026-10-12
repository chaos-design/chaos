(() => {
  const templates = (window.CHAOS_TEMPLATES ?? []).slice();
  const state = {
    pm: 'pnpm',
    dir: 'my-app',
    templateId: templates.length > 0 ? templates[0].id : null,
    filter: '',
  };

  const catalogEl = document.getElementById('catalog');
  const emptyEl = document.getElementById('empty-state');
  const commandEl = document.getElementById('command-text');
  const copyBtn = document.getElementById('copy-btn');
  const dirInput = document.getElementById('dir-input');
  const filterInput = document.getElementById('filter-input');
  const pmGroup = document.querySelector('.segmented');

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

  const renderCatalog = () => {
    const keyword = state.filter.trim().toLowerCase();
    const groups = [];
    const groupIndex = new Map();

    for (const template of templates) {
      if (!matchesFilter(template, keyword)) {
        continue;
      }

      if (!groupIndex.has(template.category)) {
        groupIndex.set(template.category, groups.length);
        groups.push({ label: template.categoryLabel, items: [] });
      }

      groups[groupIndex.get(template.category)].items.push(template);
    }

    catalogEl.innerHTML = groups
      .map((group) => {
        const cards = group.items
          .map((template) => {
            const selected = template.id === state.templateId;

            return (
              `<button type="button" class="card${selected ? ' is-selected' : ''}"` +
              ` data-id="${escapeHtml(template.id)}"` +
              ` aria-pressed="${selected ? 'true' : 'false'}">` +
              `<span class="card-title">${escapeHtml(template.title)}</span>` +
              `<span class="card-alias">-t ${escapeHtml(template.alias)}</span>` +
              `<span class="card-desc">${escapeHtml(template.description)}</span>` +
              '</button>'
            );
          })
          .join('');

        return (
          `<section class="category">` +
          `<h2 class="category-title">${escapeHtml(group.label)}` +
          ` <span class="category-count">${group.items.length}</span></h2>` +
          `<div class="grid">${cards}</div>` +
          '</section>'
        );
      })
      .join('');

    emptyEl.hidden = groups.length > 0;
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

  const render = () => {
    renderCatalog();
    renderCommand();
  };

  const selectTemplate = (id) => {
    state.templateId = id;
    render();
  };

  const setActivePm = (pm) => {
    state.pm = pm;

    for (const button of pmGroup.querySelectorAll('.seg')) {
      const active = button.dataset.pm === pm;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    }

    renderCommand();
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

  // Last resort when both clipboard paths are blocked (permissions policy,
  // insecure context, headless): select the command so Ctrl/Cmd+C works.
  const selectCommand = () => {
    const range = document.createRange();
    range.selectNodeContents(commandEl);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
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
        selectCommand();
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

  catalogEl.addEventListener('click', (event) => {
    const card = event.target.closest('.card');

    if (card) {
      selectTemplate(card.dataset.id);
    }
  });

  pmGroup.addEventListener('click', (event) => {
    const button = event.target.closest('.seg');

    if (button) {
      setActivePm(button.dataset.pm);
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

  copyBtn.addEventListener('click', copyCommand);

  render();
})();
