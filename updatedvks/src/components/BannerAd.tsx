import React, { useEffect } from 'react';
import { AdMob, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';

export const BannerAd: React.FC = () => {
  useEffect(() => {
    const showBanner = async () => {
      try {
        await AdMob.showBanner({
          adId: 'ca-app-pub-3940256099942544/6300978111', // Test Banner ID
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.TOP_CENTER,
          margin: 0,
          isTesting: true
        });
      } catch (e) {
        console.error('Failed to show banner', e);
      }
    };

    showBanner();

    return () => {
      AdMob.hideBanner().catch(() => {});
      AdMob.removeBanner().catch(() => {});
    };
  }, []);

  return null; // The banner is handled by the native overlay
};
