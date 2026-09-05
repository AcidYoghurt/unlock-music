export interface MusicNotification {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface MusicUiPort {
  notify(notification: MusicNotification): void;
  confirm(message: string, title: string): Promise<boolean>;
}
