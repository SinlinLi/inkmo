// Editor-mode cycle: WYSIWYG → IR → SV → WYSIWYG …

import type { EditorMode } from '../lib/storage';

export const MODE_LABEL: Record<EditorMode, string> = {
  wysiwyg: '所见即所得',
  ir: '即时渲染',
  sv: '分屏预览',
};

export function nextMode(current: EditorMode): EditorMode {
  switch (current) {
    case 'wysiwyg':
      return 'ir';
    case 'ir':
      return 'sv';
    case 'sv':
    default:
      return 'wysiwyg';
  }
}
