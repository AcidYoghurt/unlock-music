import { ElMessageBox, ElNotification } from 'element-plus';

import type { MusicUiPort } from '@/application/ports/MusicUiPort';

export const elementPlusMusicUi: MusicUiPort = {
  notify(notification) {
    ElNotification(notification);
  },

  async confirm(message, title) {
    try {
      await ElMessageBox.confirm(message, title, {
        confirmButtonText: '使用',
        cancelButtonText: '不使用',
        type: 'warning',
        center: true,
      });
      return true;
    } catch (_) {
      return false;
    }
  },
};
