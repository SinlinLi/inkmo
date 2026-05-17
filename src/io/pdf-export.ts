// Export the rendered Markdown as a PDF using the browser's native print pipeline.
// We assemble a clean HTML preview into `.print-container`, sanitize with DOMPurify,
// toggle `body.printing`, then call window.print(). Print stylesheet (print.css)
// hides the live UI and styles the preview for A4 output.

import DOMPurify from 'dompurify';
import { logger } from '../lib/logger';

const log = logger.scope('pdf');

export interface PdfExportOpts {
  html: string; // Rendered HTML from vditor.getHTML()
}

export function exportPdf(opts: PdfExportOpts): Promise<void> {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const safeHtml = DOMPurify.sanitize(opts.html, {
      ADD_TAGS: ['details', 'summary', 'svg', 'path', 'rect', 'circle', 'line', 'g'],
      ADD_ATTR: ['target', 'viewBox', 'fill', 'stroke', 'd', 'aria-label'],
    });

    let container = document.getElementById('print-container') as HTMLDivElement | null;
    if (!container) {
      container = document.createElement('div');
      container.id = 'print-container';
      container.className = 'print-container';
      document.body.appendChild(container);
    }
    container.innerHTML = safeHtml;
    document.body.classList.add('printing');

    const cleanup = (): void => {
      document.body.classList.remove('printing');
      if (container) container.innerHTML = '';
      window.removeEventListener('afterprint', onAfterPrint);
      log.info('pdf export done', { ms: Math.round(performance.now() - t0) });
      resolve();
    };
    const onAfterPrint = (): void => cleanup();

    window.addEventListener('afterprint', onAfterPrint);
    log.info('pdf export start', { htmlBytes: safeHtml.length });

    // Defer to next frame to ensure styles apply before the print dialog opens
    requestAnimationFrame(() => {
      try {
        window.print();
      } catch (err) {
        log.error('window.print failed', { err: String(err) });
        cleanup();
      }
      // Some browsers (notably older Safari) never fire afterprint.
      // Failsafe: clean up after 30s regardless.
      setTimeout(cleanup, 30_000);
    });
  });
}
