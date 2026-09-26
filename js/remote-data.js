import { convex } from './state.js';

const requests = new Map();
function paintStatus() {
  const values = [...requests.values()];
  const failed = values.filter(value => value.error).map(value => value.label);
  const pending = values.some(value => value.loading);
  const message = failed.length
    ? `${failed.join(', ')} could not be refreshed. You can still browse the loaded collection.`
    : pending ? 'Checking for community updates…' : '';
  document.getElementById('remoteStatus').hidden = !message;
  document.getElementById('remoteMessage').textContent = message;
  document.getElementById('retryCollection').hidden = !failed.length;
  document.getElementById('retryCollection').disabled = pending;
  document.getElementById('refreshCollection').disabled = pending;
}

/** Keep the last successful resource and ignore superseded replies. Each
 * resource has its own status, so votes cannot block the public collection. */
export async function loadResource(label, name, args, apply) {
  const request = {label, loading:true, error:false};
  requests.set(name, request);
  paintStatus();
  try {
    const value = await convex.query(name, args);
    if (requests.get(name) === request) apply(value);
  } catch {
    if (requests.get(name) === request) request.error = true;
  } finally {
    if (requests.get(name) === request) { request.loading = false; paintStatus(); }
  }
}
