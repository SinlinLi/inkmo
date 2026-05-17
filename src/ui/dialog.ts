// Tiny modal dialog. Returns a destroy() function and resolves a Promise<boolean>
// on confirm (true) / cancel (false). Used for confirm prompts and About / Help / Settings.

export interface DialogOpts {
  title: string;
  body: string | HTMLElement;
  okLabel?: string;
  cancelLabel?: string | null; // pass null to hide cancel
  onOk?(): void;
}

export function openDialog(opts: DialogOpts): Promise<boolean> {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'dialog-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');

    const dlg = document.createElement('div');
    dlg.className = 'dialog';

    const h = document.createElement('h2');
    h.textContent = opts.title;
    dlg.appendChild(h);

    if (typeof opts.body === 'string') {
      const p = document.createElement('div');
      p.innerHTML = opts.body;
      dlg.appendChild(p);
    } else {
      dlg.appendChild(opts.body);
    }

    const footer = document.createElement('div');
    footer.className = 'dialog-footer';

    const close = (ok: boolean): void => {
      backdrop.remove();
      window.removeEventListener('keydown', onKey);
      resolve(ok);
    };

    if (opts.cancelLabel !== null) {
      const cancel = document.createElement('button');
      cancel.className = 'btn';
      cancel.type = 'button';
      cancel.textContent = opts.cancelLabel ?? '取消';
      cancel.addEventListener('click', () => close(false));
      footer.appendChild(cancel);
    }

    const ok = document.createElement('button');
    ok.className = 'btn btn-primary';
    ok.type = 'button';
    ok.textContent = opts.okLabel ?? '确定';
    ok.addEventListener('click', () => {
      opts.onOk?.();
      close(true);
    });
    footer.appendChild(ok);

    dlg.appendChild(footer);
    backdrop.appendChild(dlg);

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) close(false);
    });

    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') close(false);
      else if (e.key === 'Enter') {
        opts.onOk?.();
        close(true);
      }
    };
    window.addEventListener('keydown', onKey);

    document.body.appendChild(backdrop);
    ok.focus();
  });
}
