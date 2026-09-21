---
name: Meme Vault
description: A shared meme collection with a dark Neorgon shell, blue organization controls, and rose voting feedback.
---

# Design System: Meme Vault

## Context

A teammate is browsing the vault beside a dark chat window, looking for a reaction to send without breaking their flow. Keep the established dark shell and let the images carry the color. Use restrained blue for actions and selections, with rose reserved for votes.

The Neorgon header, themes, footer, and Auth Kit are vendored suite components. Do not edit them locally. Keep their slots, sign-in behavior, and theme controls intact.

## Tokens

The application tokens live in `css/style.css`. Neutrals use OKLCH with a slight cool tint: background at 15% lightness, surfaces at 19% and 23%, primary text at 96%, secondary text at 81%, and muted text at 68%. Blue action backgrounds use 49% lightness; readable action text uses a lighter blue. Rose and red indicate positive and negative vote states, accompanied by numeric scores and pressed states.

Use the suite's sans serif stack for body and headings. Keep headings at 2rem on desktop and 1.5rem on small screens, section titles at 1.125rem, body at .875rem, and secondary controls at .75rem. Use 6px control corners and 10px card corners.

## Layout

- The introduction pairs a short collection heading with a compact daily pick.
- Desktop uses a 204px category and label sidebar beside the search, results and image grid.
- Below 760px, the sidebar becomes an expandable filter section and the gallery uses two columns.
- Category buttons show readable names and counts. Labels are independent, combinable filters. Active filters appear above the results with individual remove actions and Clear all.
- Cards show complete images with `object-fit: contain`, a name, category, labels and vote controls. The Organize action opens the existing viewer. Touch devices show image actions below the image so controls do not cover its caption.
- The viewer pairs the image with metadata and actions on desktop, stacking them on smaller screens. Organization is a progressive form within the viewer.

## Organization controls

Each meme has one category and up to eight labels. Both the upload form and viewer share the same label editor: Enter or comma adds a label; a remove button deletes it; Backspace removes the last label when the input is empty. Suggestions come from labels already in use. Saving commits any pending text.

Category inputs suggest existing categories and accept custom ones. Friendly built-in names normalize to existing keys. Labels are case-insensitive and deduplicated. New categories join the navigation as soon as a meme is saved to them.

Shared edits require ownership or administrator rights, enforced by Convex. Signed-out visitors see a sign-in action; signed-in visitors without permission see a reason. Failed saves keep the draft and show an inline retry message.

## Accessibility and motion

Use visible labels, named icon buttons, pressed states for filters and votes, and live text for result counts and errors. The closed viewer is inert. When it opens, background landmarks become inert and focus stays inside; closing returns focus to the triggering control or search if that control has been replaced. Arrow keys navigate memes only outside the organization form.

Transitions communicate hover, focus and visibility, with no staggered card entrance. Honor reduced motion for both CSS transitions and JavaScript scrolling. Search is also available through the `/` shortcut outside text fields.

## Security and deployment

Keep the document's strict Content Security Policy and existing origin allowlist. Render user-created categories and labels as text nodes. Sign-in remains exclusively owned by the Neorgon Auth Kit.

The optional `memes.labels` field and the `memeOrganization` table support shared organization. Deploy the Convex schema and functions before the frontend. Bundled image paths, stable meme names and vote identities are unchanged.
