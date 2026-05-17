// Editor-mode cycle.
//
// The Vditor library has three internal modes: WYSIWYG / IR (Instant Render) /
// SV (Split View). We expose only IR and SV to keep the UX choice clear:
//
//   - IR : Markdown markers stay visible, but their rendered styling appears
//          inline alongside them. Best of both worlds for most authors.
//   - SV : Classic split editor + preview.
//
// WYSIWYG (markers hidden, "Typora-style") is still supported by Vditor — any
// state persisted from an older session falls through to IR on next cycle.

import type { EditorMode } from '../lib/storage';

export const MODE_LABEL: Record<EditorMode, string> = {
  wysiwyg: '所见即所得',
  ir: '即时渲染',
  sv: '分屏预览',
};

export function nextMode(current: EditorMode): EditorMode {
  switch (current) {
    case 'ir':
      return 'sv';
    case 'sv':
      return 'ir';
    case 'wysiwyg':
    default:
      // Legacy wysiwyg state from older deployments → migrate to ir on toggle.
      return 'ir';
  }
}
