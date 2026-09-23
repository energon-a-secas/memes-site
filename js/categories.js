// ── Categories: the field picker and the admin manager ───────────────
import { state, convex, api } from './state.js';
import { openPicker } from './picker.js';
import { categoryChoices, rebuildChips, filterGrid } from './render.js';
import { loadConvexMemes, loadOrganization } from './events.js';
import { categoryName, validateCategory, MAX_CATEGORY_LENGTH } from './organization.js';
import { showToast, errorMessage } from './utils.js';

/** Turn a button into a category field backed by the picker popup. */
export function createCategoryField(button, { value = 'general' } = {}) {
  let current = value;

  function paint() {
    const name = document.createElement('span');
    name.className = 'field-picker-value';
    name.textContent = categoryName(current);
    const change = document.createElement('span');
    change.className = 'field-picker-change';
    change.textContent = 'Change';
    button.replaceChildren(name, change);
    button.setAttribute('aria-label', `Category: ${categoryName(current)}. Choose another.`);
  }

  button.addEventListener('click', async event => {
    const picked = await openPicker({
      title: 'Category',
      hint: 'One category per meme. Pick an existing one, or add your own.',
      options: categoryChoices(),
      chosen: [current],
      createLabel: 'New category',
      invoker: event.currentTarget,
      onCreate(raw) {
        // validateCategory is the same rule the server applies, so a name the
        // dialog accepts cannot be rejected after the upload has started.
        const category = validateCategory(raw);
        return categoryChoices().find(option => option.value === category)
          || { value: category, label: categoryName(category), count: 0 };
      },
    });
    if (picked?.length) { current = picked[0]; paint(); }
  });

  paint();
  return {
    get value() { return current; },
    set value(next) { current = next; paint(); },
  };
}

export async function loadCategories() {
  try {
    state.customCategories = await convex.query(api.categories.list, {});
    rebuildChips();
  } catch (error) {
    console.warn('Categories not available:', error.message);
  }
}

// ── Admin manager ────────────────────────────────────────────────────
// Its own dialog rather than the picker: every row carries two destructive
// controls and an inline rename field, which a list of choices should not.
let manager = null;
let managerReturnFocus = null;

function buildManager() {
  const element = document.createElement('dialog');
  element.className = 'picker cat-admin';
  element.innerHTML = `
    <div class="picker-head">
      <div><h2 class="picker-title">Categories</h2><p class="picker-hint field-hint">Renaming moves every meme in a category, bundled ones included. Removing sends them to General.</p></div>
      <button type="button" class="picker-close" aria-label="Close">&times;</button>
    </div>
    <div class="cat-admin-list"></div>
    <form class="picker-create">
      <label class="picker-create-label" for="catAdminNew">New category</label>
      <div class="picker-create-row">
        <input type="text" class="picker-create-input" id="catAdminNew" maxlength="${MAX_CATEGORY_LENGTH}" autocomplete="off">
        <button type="submit" class="text-button picker-create-submit">Add</button>
      </div>
    </form>
    <p class="field-error picker-error" role="alert"></p>
    <div class="picker-actions"><span class="picker-status" role="status"></span><button type="button" class="primary-button cat-admin-done">Done</button></div>`;
  document.body.append(element);

  manager = {
    element,
    list: element.querySelector('.cat-admin-list'),
    createInput: element.querySelector('.picker-create-input'),
    error: element.querySelector('.picker-error'),
    status: element.querySelector('.picker-status'),
    busy: false,
  };

  const close = () => {
    if (manager.busy) return;
    element.close();
    if (managerReturnFocus?.isConnected) managerReturnFocus.focus();
  };
  element.querySelector('.picker-close').addEventListener('click', close);
  element.querySelector('.cat-admin-done').addEventListener('click', close);
  element.addEventListener('cancel', event => { event.preventDefault(); close(); });
  element.addEventListener('click', event => { if (event.target === element) close(); });
  element.querySelector('.picker-create').addEventListener('submit', event => {
    event.preventDefault();
    void run(
      () => convex.mutation(api.categories.create, { name: manager.createInput.value }),
      name => { manager.createInput.value = ''; return `Added ${categoryName(name)}`; },
    );
  });
  return manager;
}

/**
 * Every mutation goes through here so the dialog can never be left half-updated:
 * it locks while the server is working, reloads all three stores afterwards, and
 * shows the server's own message when something is refused.
 */
async function run(mutate, describe) {
  if (manager.busy) return;
  manager.busy = true;
  manager.error.textContent = '';
  manager.status.textContent = 'Saving…';
  manager.element.querySelectorAll('button, input').forEach(control => { control.disabled = true; });
  try {
    const result = await mutate();
    await Promise.all([loadCategories(), loadConvexMemes({ render: false }), loadOrganization()]);
    filterGrid();
    manager.status.textContent = describe(result);
  } catch (error) {
    console.error('Category change failed:', error);
    manager.error.textContent = errorMessage(error, 'That change did not go through. Nothing was altered.');
    manager.status.textContent = '';
  } finally {
    manager.busy = false;
    manager.element.querySelectorAll('button, input').forEach(control => { control.disabled = false; });
    paintManager();
  }
}

function renameRow(row, choice) {
  const form = document.createElement('form');
  form.className = 'cat-admin-rename';
  const input = document.createElement('input');
  input.type = 'text';
  input.value = choice.label;
  input.maxLength = MAX_CATEGORY_LENGTH;
  input.setAttribute('aria-label', `New name for ${choice.label}`);
  const save = document.createElement('button');
  save.type = 'submit';
  save.className = 'text-button';
  save.textContent = 'Save';
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'text-button';
  cancel.textContent = 'Cancel';
  cancel.addEventListener('click', paintManager);
  form.addEventListener('submit', event => {
    event.preventDefault();
    void run(
      () => convex.mutation(api.categories.rename, { from: choice.value, to: input.value }),
      result => `${choice.label} is now ${categoryName(result.to)} (${result.moved} moved)`,
    );
  });
  form.append(input, save, cancel);
  row.replaceChildren(form);
  input.focus();
  input.select();
}

function paintManager() {
  manager.list.replaceChildren();
  for (const choice of categoryChoices()) {
    const row = document.createElement('div');
    row.className = 'cat-admin-row';

    const name = document.createElement('span');
    name.className = 'cat-admin-name';
    name.textContent = choice.label;
    const count = document.createElement('span');
    count.className = 'picker-option-count';
    count.textContent = choice.count;

    const rename = document.createElement('button');
    rename.type = 'button';
    rename.className = 'text-button';
    rename.textContent = 'Rename';
    rename.setAttribute('aria-label', `Rename ${choice.label}`);
    rename.addEventListener('click', () => renameRow(row, choice));

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'text-button cat-admin-remove';
    remove.textContent = 'Remove';
    remove.setAttribute('aria-label', `Remove ${choice.label}`);
    remove.disabled = choice.value === 'general';
    remove.title = choice.value === 'general' ? 'General is where removed categories send their memes.' : '';
    remove.addEventListener('click', () => {
      const moving = choice.count ? `Its ${choice.count} meme${choice.count === 1 ? '' : 's'} will move to General.` : 'It holds no memes.';
      if (!confirm(`Remove “${choice.label}”? ${moving}`)) return;
      void run(
        () => convex.mutation(api.categories.remove, { name: choice.value }),
        result => `Removed ${choice.label} (${result.moved} moved to General)`,
      );
    });

    row.append(name, count, rename, remove);
    manager.list.append(row);
  }
}

export function openCategoryAdmin(invoker) {
  if (!state.isConvexAdmin) { showToast('Only an admin can manage categories.'); return; }
  if (!manager) buildManager();
  managerReturnFocus = invoker || document.activeElement;
  manager.error.textContent = '';
  manager.status.textContent = '';
  manager.createInput.value = '';
  paintManager();
  manager.element.showModal();
  manager.element.querySelector('.cat-admin-name') ? manager.list.querySelector('button')?.focus() : manager.createInput.focus();
}
