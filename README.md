# Unlock Music 音乐解锁

[![Build Status](https://git.unlock-music.dev/um/web/actions/workflows/build.yml/badge.svg)][ci]

- 在浏览器中解锁加密的音乐文件。 Unlock encrypted music file in the browser.
- Unlock Music 项目是以学习和技术研究的初衷创建的，修改、再分发时请遵循[授权协议]。
- Unlock Music 的 CLI 版本可以在 [unlock-music/cli] 找到，大批量转换建议使用 CLI 版本。
- 我们新建了 Telegram 群组 [`@unlock_music_chat`] ，欢迎加入！
- CI 自动构建已经部署，可以在 [Actions][ci] 下载

> **WARNING**
> 在本站 fork 不会起到备份的作用，只会浪费服务器储存空间。如无必要请勿 fork 该仓库。

[授权协议]: https://git.unlock-music.dev/um/web/src/branch/main/LICENSE
[unlock-music/cli]: https://git.unlock-music.dev/um/cli
[`@unlock_music_chat`]: https://t.me/unlock_music_chat
[ci]: https://git.unlock-music.dev/um/web/actions?workflow=build.yml

## 关于仓库官方

本仓库原始地址（已 DMCA）：https://github.com/unlock-music/unlock-music

本仓库目前官方地址：https://git.unlock-music.dev/um/web

你所看到的这个仓库是依照 MIT 协议授权转载的，代码与[本人](https://github.com/ipid)无关。

## 特性

### 支持的格式

- [x] QQ 音乐 (.qmc0/.qmc2/.qmc3/.qmcflac/.qmcogg/.tkm)
- [x] Moo 音乐格式 (.bkcmp3/.bkcflac/...)
- [x] QQ 音乐 Tm 格式 (.tm0/.tm2/.tm3/.tm6)
- [x] QQ 音乐新格式 (.mflac/.mgg/.mflac0/.mgg1/.mggl)
- [x] <ruby>QQ 音乐海外版<rt>JOOX Music</rt></ruby> (.ofl_en)
- [x] 网易云音乐格式 (.ncm)
- [x] 虾米音乐格式 (.xm)
- [x] 酷我音乐格式 (.kwm)
- [x] 酷狗音乐格式 (.kgm/.vpr)
- [x] Android 版喜马拉雅文件格式 (.x2m/.x3m)
- [x] 咪咕音乐格式 (.mg3d)

### 其他特性

- [x] 在浏览器中解锁
- [x] 拖放文件
- [x] 批量解锁
- [x] 渐进式 Web 应用 (PWA)
- [x] 多线程
- [x] 写入和编辑元信息与专辑封面

## 使用方法

### 使用预构建版本

- 从 [Release] 或 [CI 构建][ci] 下载预构建的版本
- 解压后把文件交给任意静态 Web 服务器即可使用。
- 当前版本使用原生 ES 模块，必须通过 HTTP(S) 访问，不能直接双击 `index.html` 运行。

[release]: https://git.unlock-music.dev/um/web/releases/latest

### 自行构建

- 环境要求
  - Node.js v24.20.0
  - npm

1. 获取项目源代码后安装相关依赖：

   ```sh
   npm ci
   ```

2. 然后进行构建：

   ```sh
   npm run build
   ```

   - 构建后的静态产物位于 `dist` 目录，可部署到 Nginx、GitHub Pages、Cloudflare Pages 等静态托管服务。
   - 本地预览生产包：`npm run preview`。
   - 开发环境：`npm run dev`。

3. 如需构建浏览器扩展，构建成功后还需要执行：

   ```sh
   npm run make-extension
   ```

### Docker 部署

先执行 `npm ci && npm run build`，然后在项目根目录运行：

```sh
docker build -t unlock-music .
docker run --rm -p 8080:80 unlock-music
```

浏览器访问 `http://localhost:8080`。
