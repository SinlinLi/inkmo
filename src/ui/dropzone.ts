// Full-screen file drop overlay. Calls back with the dropped File.

export function installDropzone(onDrop: (file: File) => void): HTMLElement {
  const el = document.createElement('div');
  el.className = 'dropzone';
  el.textContent = '松开以打开文件 (.md / .markdown / .txt)';
  el.setAttribute('aria-hidden', 'true');
  document.body.appendChild(el);

  let depth = 0;
  const show = (): void => {
    depth++;
    el.classList.add('is-active');
  };
  const hide = (): void => {
    depth = Math.max(0, depth - 1);
    if (depth === 0) el.classList.remove('is-active');
  };

  window.addEventListener('dragenter', (e) => {
    if (e.dataTransfer?.types?.includes('Files')) show();
  });
  window.addEventListener('dragover', (e) => {
    if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
  });
  window.addEventListener('dragleave', () => hide());
  window.addEventListener('drop', (e) => {
    if (!e.dataTransfer?.types?.includes('Files')) return;
    e.preventDefault();
    depth = 0;
    el.classList.remove('is-active');
    const file = e.dataTransfer.files?.[0];
    if (file) onDrop(file);
  });

  return el;
}
