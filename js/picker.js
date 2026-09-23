// ── Shared picker popup ──────────────────────────────────────────────
// One dialog backs the category field, the label browser and the admin
// category manager. It is appended to <body>, never to <main>: openLightbox()
// sets main.inert, which is exactly what silenced the <datalist> this replaces.
const fold = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

let dialog = null;
let session = null;

function build() {
  const element = document.createElement('dialog');
  element.className = 'picker';
  element.innerHTML = `
    <div class="picker-head">
      <div><h2 class="picker-title"></h2><p class="picker-hint field-hint"></p></div>
      <button type="button" class="picker-close" aria-label="Close">&times;</button>
    </div>
    <input type="search" class="picker-search" placeholder="Search…" autocomplete="off">
    <div class="picker-list" role="listbox" tabindex="-1"></div>
    <form class="picker-create" hidden>
      <label class="picker-create-label"></label>
      <div class="picker-create-row">
        <input type="text" class="picker-create-input" maxlength="40" autocomplete="off">
        <button type="submit" class="text-button picker-create-submit">Add</button>
      </div>
    </form>
    <p class="field-error picker-error" role="alert"></p>
    <div class="picker-actions">
      <span class="picker-status" role="status"></span>
      <button type="button" class="text-button picker-cancel">Cancel</button>
      <button type="button" class="primary-button picker-done">Done</button>
    </div>`;
  document.body.append(element);

  const parts = {
    element,
    title: element.querySelector('.picker-title'),
    hint: element.querySelector('.picker-hint'),
    search: element.querySelector('.picker-search'),
    list: element.querySelector('.picker-list'),
    createForm: element.querySelector('.picker-create'),
    createLabel: element.querySelector('.picker-create-label'),
    createInput: element.querySelector('.picker-create-input'),
    error: element.querySelector('.picker-error'),
    status: element.querySelector('.picker-status'),
    done: element.querySelector('.picker-done'),
  };

  parts.search.addEventListener('input', paintList);
  element.querySelector('.picker-close').addEventListener('click', () => settle(null));
  element.querySelector('.picker-cancel').addEventListener('click', () => settle(null));
  parts.done.addEventListener('click', () => settle(session.chosen));
  // A backdrop click and Escape both mean "changed my mind", not "save nothing".
  element.addEventListener('cancel', event => { event.preventDefault(); settle(null); });
  element.addEventListener('click', event => { if (event.target === element) settle(null); });
  parts.createForm.addEventListener('submit', event => { event.preventDefault(); void submitCreate(); });
  parts.search.addEventListener('keydown', event => {
    if (event.key !== 'ArrowDown') return;
    event.preventDefault();
    parts.list.querySelector('.picker-option')?.focus();
  });
  parts.list.addEventListener('keydown', event => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const options = [...parts.list.querySelectorAll('.picker-option')];
    const at = options.indexOf(document.activeElement);
    const next = event.key === 'ArrowDown' ? at + 1 : at - 1;
    if (next < 0) parts.search.focus();
    else options[Math.min(next, options.length - 1)]?.focus();
  });
  return parts;
}

function settle(value) {
  if (!session) return;
  const { resolve, invoker } = session;
  session = null;
  dialog.element.close();
  if (invoker?.isConnected) invoker.focus();
  resolve(value);
}

function matches(option, query) {
  if (!query) return true;
  return fold(`${option.label} ${option.value}`).includes(query);
}

function paintList() {
  const { list, search, status } = dialog;
  const query = fold(search.value).trim();
  const visible = session.options.filter(option => matches(option, query));
  list.replaceChildren();

  for (const option of visible) {
    const chosen = session.chosen.includes(option.value);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'picker-option' + (chosen ? ' chosen' : '');
    button.setAttribute('role', 'option');
    button.setAttribute('aria-selected', String(chosen));
    const name = document.createElement('span');
    name.className = 'picker-option-name';
    name.textContent = option.label;
    button.append(name);
    if (option.count !== undefined) {
      const count = document.createElement('span');
      count.className = 'picker-option-count';
      count.textContent = option.count;
      button.append(count);
    }
    button.addEventListener('click', () => choose(option.value));
    list.append(button);
  }

  if (!visible.length) {
    const empty = document.createElement('p');
    empty.className = 'field-hint picker-empty';
    empty.textContent = session.options.length
      ? 'Nothing matches that search.'
      : session.emptyHint || 'Nothing here yet.';
    list.append(empty);
  }

  if (!session.multiple) status.textContent = '';
  else if (session.max) status.textContent = `${session.chosen.length} of ${session.max} chosen`;
  else status.textContent = `${session.chosen.length} chosen`;
}

function choose(value) {
  if (!session.multiple) { settle([value]); return; }
  const at = session.chosen.indexOf(value);
  if (at >= 0) session.chosen.splice(at, 1);
  else if (session.max && session.chosen.length >= session.max) {
    dialog.error.textContent = `Up to ${session.max} at a time.`;
    return;
  } else session.chosen.push(value);
  dialog.error.textContent = '';
  paintList();
}

async function submitCreate() {
  const raw = dialog.createInput.value.trim();
  if (!raw) return;
  dialog.error.textContent = '';
  dialog.createInput.disabled = true;
  try {
    const created = await session.onCreate(raw);
    if (created) {
      // A freshly created entry is what the person came for, so pick it too.
      if (!session.options.some(option => option.value === created.value)) session.options.unshift(created);
      dialog.createInput.value = '';
      if (session.multiple) {
        if (!session.chosen.includes(created.value)) choose(created.value);
        else paintList();
      } else settle([created.value]);
    }
  } catch (error) {
    dialog.error.textContent = error.message;
  } finally {
    dialog.createInput.disabled = false;
    if (session) dialog.createInput.focus();
  }
}

/**
 * Open the picker. Resolves with the chosen values, or null when dismissed:
 * null means "leave things alone", which an empty array does not.
 *
 * `onCreate` takes the typed text and returns `{ value, label, count }` for the
 * new entry, or throws an Error whose message is shown in the dialog.
 */
export function openPicker({
  title, hint = '', options, chosen = [], multiple = false, max = null,
  createLabel = '', onCreate = null, emptyHint = '', invoker = null,
} = {}) {
  if (!dialog) dialog = build();
  if (session) settle(null);
  return new Promise(resolve => {
    session = { options: [...options], chosen: [...chosen], multiple, max, onCreate, emptyHint, resolve, invoker: invoker || document.activeElement };
    dialog.title.textContent = title;
    dialog.hint.textContent = hint;
    dialog.hint.hidden = !hint;
    dialog.search.value = '';
    dialog.error.textContent = '';
    dialog.createInput.value = '';
    dialog.createForm.hidden = !onCreate;
    dialog.createLabel.textContent = createLabel;
    dialog.done.hidden = !multiple;
    dialog.element.classList.toggle('picker--single', !multiple);
    paintList();
    dialog.element.showModal();
    dialog.search.focus();
  });
}

/** True while the picker owns the screen, so other key handlers can stand down. */
export const pickerIsOpen = () => !!session;
