# 部署 · Deployment

本项目是纯静态前端应用。任何能托管静态资源 + 正确设置 CSP/缓存头的方式都可以用。下面给出最常见的几种部署方式。

## 1. Docker Compose（推荐）

最简单：

```bash
docker compose up -d
# → http://localhost:8080
```

`docker-compose.yml` 已暴露 8080。要改端口或加 HTTPS 反代，按需修改。

## 2. Docker 镜像

```bash
docker build -t markdown-editor:0.1.0 .
docker run -d -p 8080:80 --name markdown-editor markdown-editor:0.1.0
```

镜像基于 `nginx:1.27-alpine`，多阶段构建产物约 30 MB（包含 Vditor lazy 资源），运行时内存 < 20 MB。

## 3. 手动 nginx 部署

适合已有 nginx 服务器、想直接放进现有站点目录的场景。

### 步骤

```bash
# 在开发机
pnpm install
pnpm run build

# 把产物复制到服务器
scp -r dist/ user@server:/var/www/markdown-editor/

# 服务器：把 nginx/default.conf 中的 root 改成 /var/www/markdown-editor，然后 reload
```

把 `nginx/default.conf` 整段复制到 nginx 的 `conf.d/` 或 sites-available/，调整 `server_name` 与 `root`。

### 关键配置要点

| 头 / 设置                         | 推荐值                                | 原因                            |
| --------------------------------- | ------------------------------------- | ------------------------------- |
| `gzip` / `gzip_static`            | on                                    | 减小传输体积                    |
| `Cache-Control` for `/assets/*`   | `public, max-age=31536000, immutable` | Vite 已做 content-hashed 文件名 |
| `Cache-Control` for `/index.html` | `no-cache`                            | 部署后即时生效                  |
| CSP                               | 见下方                                | 限制脚本来源                    |
| `X-Content-Type-Options`          | `nosniff`                             | 防 MIME 嗅探                    |
| `X-Frame-Options`                 | `DENY`                                | 防嵌入 iframe                   |

### CSP

`nginx/default.conf` 内置的 CSP：

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  worker-src 'self' blob:;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  font-src 'self' data:;
  connect-src 'self';
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'none';
```

如果需要在 Markdown 中显示外链图片，把 `img-src` 改为：

```
img-src 'self' data: blob: https:;
```

## 4. 反向代理（HTTPS）

把上方任一方案放在反向代理后面。Caddy 示例：

```caddy
markdown.example.com {
  reverse_proxy localhost:8080
  encode gzip
}
```

Caddy 会自动签发 Let's Encrypt 证书；nginx 容器本身不需要管 HTTPS。

## 5. 静态托管平台

把 `dist/` 上传到 Cloudflare Pages / Netlify / Vercel / GitHub Pages 即可。注意：

- 这些平台默认 CSP 较宽松，建议在平台的 `_headers` 或等价配置文件里加上本项目的 CSP
- 路径前缀有变的话，调整 `vite.config.ts` 的 `base` 选项

## 健康检查

可用以下方法做存活探针：

```bash
curl -fsS http://localhost:8080/ > /dev/null && echo OK
```

或检查 `/index.html` 返回 200。

## 升级

```bash
docker compose pull && docker compose up -d   # 镜像更新
# 或
git pull && pnpm run build && cp -r dist/* /var/www/markdown-editor/   # 手动
```

`Cache-Control: no-cache` on `index.html` 保证用户下次刷新即可加载新版本。
