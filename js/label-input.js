import { MAX_LABELS, MAX_LABEL_LENGTH, normalizeLabel } from './organization.js';
import { openPicker } from './picker.js';

/**
 * Label editor shared by uploads and the meme organizer.
 *
 * Typing still works, but the way in is now "Browse labels": a popup listing
 * what the vault already uses, busiest first. Free text alone produced "work",
 * "works" and "working" as three separate labels, because nobody could see the
 * first one while typing the second.
 */
export function createLabelInput(root, { id, choices = () => [] }) {
  let labels = [];
  root.innerHTML = `<div class="label-input-wrap"><div class="label-input-tokens"></div><input type="text" id="${id}" placeholder="Type a label, then press Enter" autocomplete="off" maxlength="264" aria-describedby="${id}Hint ${id}Error"></div><div class="label-input-tools"><button type="button" class="text-button label-browse" id="${id}Browse">Browse labels…</button><p class="field-hint" id="${id}Hint">Enter or comma to add. Up to ${MAX_LABELS} labels.</p></div><p class="field-error" id="${id}Error" role="status"></p>`;
  const input = root.querySelector('input');
  const tokens = root.querySelector('.label-input-tokens');
  const error = root.querySelector('.field-error');
  const browse = root.querySelector('.label-browse');

  function render() {
    tokens.replaceChildren();
    labels.forEach(label => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'label-token';
      button.textContent = `${label} ×`;
      button.setAttribute('aria-label', `Remove label ${label}`);
      button.addEventListener('click', () => {
        labels = labels.filter(item => item !== label);
        error.textContent = '';
        render();
        input.focus();
      });
      tokens.append(button);
    });
  }

  function commit() {
    const added = input.value.split(',').map(normalizeLabel).filter(Boolean);
    const next = [...new Set([...labels, ...added])];
    let message = '';
    if (next.length > MAX_LABELS) message = `Use up to ${MAX_LABELS} labels per meme.`;
    if (next.some(label => label.length > MAX_LABEL_LENGTH)) message = `Keep each label to ${MAX_LABEL_LENGTH} characters or fewer.`;
    error.textContent = message;
    input.setAttribute('aria-invalid', String(!!message));
    if (message) { input.focus(); return false; }
    labels = next;
    input.value = '';
    render();
    return true;
  }

  browse.addEventListener('click', async event => {
    // Anything half-typed counts as chosen before the list opens over it.
    if (!commit()) return;
    const existing = choices();
    const picked = await openPicker({
      title: 'Labels',
      hint: 'Pick from the labels already in use, or add one of your own.',
      options: existing,
      chosen: labels,
      multiple: true,
      max: MAX_LABELS,
      createLabel: 'New label',
      emptyHint: 'No labels in the vault yet. Add the first one below.',
      invoker: event.currentTarget,
      onCreate(raw) {
        const label = normalizeLabel(raw);
        if (!label) throw new Error('Type a label first.');
        if (label.length > MAX_LABEL_LENGTH) throw new Error(`Keep each label to ${MAX_LABEL_LENGTH} characters or fewer.`);
        return existing.find(option => option.value === label) || { value: label, label, count: 0 };
      },
    });
    if (!picked) return;
    labels = picked;
    error.textContent = '';
    render();
  });

  input.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); commit(); }
    if (event.key === 'Backspace' && !input.value && labels.length) { labels.pop(); render(); }
  });
  input.addEventListener('input', () => { error.textContent = ''; input.removeAttribute('aria-invalid'); });
  render();
  return {
    commit,
    getLabels: () => [...labels],
    setLabels(value = []) { labels = [...value]; input.value = ''; error.textContent = ''; input.removeAttribute('aria-invalid'); render(); },
  };
}
