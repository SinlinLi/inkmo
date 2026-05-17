// Entry: mount the app.

import './styles/main.css';
import { bootstrap } from './app';
import { logger } from './lib/logger';

const root = document.getElementById('app');
if (!root) {
  document.body.innerHTML =
    '<p style="padding:1rem;font-family:system-ui">应用加载失败：未找到挂载点 #app。</p>';
} else {
  bootstrap(root).catch((err: unknown) => {
    logger.error('bootstrap failed', { err: String(err) });
    root.innerHTML =
      '<p style="padding:1rem;font-family:system-ui;color:#b91c1c">应用启动失败，请刷新或检查控制台。</p>';
  });
}
