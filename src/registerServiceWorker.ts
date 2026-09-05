import { registerSW } from 'virtual:pwa-register';

if (import.meta.env.PROD && window.location.protocol === 'https:') {
  const updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh() {
      void updateServiceWorker(true);
    },
    onOfflineReady() {
      console.info('应用已缓存，可以离线使用。');
    },
    onRegisterError(error) {
      console.error('Service worker 注册失败：', error);
    },
  });
}
