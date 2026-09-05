<script setup lang="ts">
import { h, onMounted } from 'vue';
import { ElNotification } from 'element-plus';

import config from '../package.json';
import Home from '@/view/Home.vue';
import { checkUpdate } from '@/utils/api';

const version = config.version;
const currentYear = new Date().getFullYear();

function safeHttpUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : undefined;
  } catch (_) {
    return undefined;
  }
}

async function finishLoad() {
  document.getElementById('loader-mask')?.remove();

  let updateInfo;
  try {
    updateInfo = await checkUpdate(version);
  } catch (error) {
    console.warn('check version info failed', error);
  }

  if (
    updateInfo &&
    import.meta.env.PROD &&
    (updateInfo.HttpsFound || (updateInfo.Found && window.location.protocol !== 'https:'))
  ) {
    const updateUrl = safeHttpUrl(updateInfo.URL);
    ElNotification.warning({
      title: '发现更新',
      message: h('div', [
        h('p', `发现新版本 v${updateInfo.Version}`),
        h('p', `更新详情：${updateInfo.Detail}`),
        ...(updateUrl ? [h('a', { href: updateUrl, target: '_blank', rel: 'noopener noreferrer' }, '获取更新')] : []),
      ]),
      duration: 15_000,
      position: 'top-left',
    });
    return;
  }

  ElNotification.info({
    title: '离线使用',
    message: h('div', [
      h('p', '我们使用 PWA 技术，无网络也能使用'),
      h('div', { class: 'update-info' }, [
        h('div', { class: 'update-title' }, '最近更新'),
        h('div', { class: 'update-content' }, config.updateInfo),
      ]),
      h(
        'a',
        {
          href: 'https://git.unlock-music.dev/um/web/wiki/使用提示',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        '使用提示',
      ),
    ]),
    duration: 10_000,
    position: 'top-left',
  });
}

onMounted(() => {
  void finishLoad();
});
</script>

<template>
  <ElContainer id="app">
    <ElMain>
      <Home />
    </ElMain>
    <ElFooter id="app-footer">
      <div>
        <a href="https://git.unlock-music.dev/um/web" target="_blank" rel="noopener noreferrer">音乐解锁</a>({{
          version
        }}) ：移除已购音乐的加密保护。
        <a href="https://git.unlock-music.dev/um/web/wiki/使用提示" target="_blank" rel="noopener noreferrer">
          使用提示
        </a>
      </div>
      <div>
        目前支持 网易云音乐(ncm), QQ音乐(qmc, mflac, mgg), 酷狗音乐(kgm), 虾米音乐(xm), 酷我音乐(.kwm)
        <a
          href="https://git.unlock-music.dev/um/web/src/branch/main/README.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          更多
        </a>
        。
      </div>
      <div>
        <!--如果进行二次开发，此行版权信息不得移除且应明显地标注于页面上-->
        <span>Copyright &copy; 2019 - {{ currentYear }} MengYX</span>
        音乐解锁使用
        <a href="https://git.unlock-music.dev/um/web/src/branch/main/LICENSE" target="_blank" rel="noopener noreferrer">
          MIT许可协议
        </a>
        开放源代码
      </div>
    </ElFooter>
  </ElContainer>
</template>

<style lang="scss">
@use './scss/unlock-music';
</style>
