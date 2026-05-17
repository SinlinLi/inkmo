// Minimal toast component: stack of timed dismissible messages.

let container: HTMLElement | null = null;

function ensureContainer(): HTMLElement {
  if (container) return container;
  container = document.createElement('div');
  container.className = 'toast-stack';
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);
  return container;
}

export type ToastKind = 'info' | 'success' | 'warn' | 'error';

export function toast(message: string, kind: ToastKind = 'info', timeoutMs = 3000): void {
  const c = ensureContainer();
  const el = document.createElement('div');
  el.className = `toast toast-${kind}`;
  el.textContent = message;
  el.setAttribute('role', 'alert');
  c.appendChild(el);
  // animate in next tick
  requestAnimationFrame(() => el.classList.add('toast-show'));
  const dismiss = (): void => {
    el.classList.remove('toast-show');
    setTimeout(() => el.remove(), 200);
  };
  el.addEventListener('click', dismiss);
  setTimeout(dismiss, timeoutMs);
}
