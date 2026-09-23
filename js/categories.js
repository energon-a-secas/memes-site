// ── Categories: the field picker ─────────────────────────────────────
import { openPicker } from './picker.js';
import { categoryChoices } from './render.js';
import { categoryName, validateCategory } from './organization.js';

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
