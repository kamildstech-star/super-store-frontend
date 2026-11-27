import { useToast } from '@nuxt/ui/composables/useToast';

const variants = {
  success: { label: 'Success', icon: 'i-ri-checkbox-circle-line', duration: 4200 },
  info: { label: 'Notice', icon: 'i-ri-information-line', duration: 5000 },
  warning: { label: 'Check this', icon: 'i-ri-error-warning-line', duration: 6500 },
  error: { label: 'Could not complete', icon: 'i-ri-error-warning-line', duration: 7500 },
};

// One notification API for all POS pages. Repeated scans or API failures share a toast instead of stacking.
export function usePosNotifications() {
  const toast = useToast();
  return {
    notify(level, message, title, key) {
      if (!message) return;
      const { label, icon, duration } = variants[level] ?? variants.info;
      toast.add({
        id: key ? 'pos:' + key : 'pos:' + level + ':' + message,
        title: title ?? label,
        description: message,
        icon,
        color: level,
        duration,
        closeIcon: 'i-ri-close-line',
        close: { 'aria-label': 'Dismiss notification' },
      });
    },
    clearNotifications: toast.clear,
  };
}
