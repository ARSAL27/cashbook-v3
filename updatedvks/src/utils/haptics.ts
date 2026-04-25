import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const triggerHaptic = (style: ImpactStyle = ImpactStyle.Light) => {
  Haptics.impact({ style }).catch(() => {
    // Fail silently if not supported or not on device
  });
};

export { ImpactStyle };
