import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const sendNativeNotification = async (title: string, body: string, path: string = '/', id: number = Math.floor(Math.random() * 1000)) => {

  try {
    if (Capacitor.isNativePlatform()) {
        // ─── COMPILED ANDROID/IOS APP (NATIVE) ───
        await LocalNotifications.createChannel({
          id: 'kiryanabook_alerts',
          name: 'KiryanaBook Alerts',
          description: 'Critical shop alerts and notifications',
          importance: 5, // Max importance
          visibility: 1, // Visible on lock screen
          sound: 'default'
        });

        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }

        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id,
              schedule: { at: new Date(Date.now() + 50) }, // Fast execution
              sound: 'default',
              channelId: 'kiryanabook_alerts',
              extra: { path },
              // IMPORTANT NATIVE STYLING

              smallIcon: 'ic_stat_icon_config_sample', // Professional small icon mapping
              iconColor: '#00E676', // Deep Kiryana Green theme applied to icon
              autoCancel: true // Disappears gracefully when tapped
            }
          ]
        });
    } else {
        // ─── MOBILE BROWSER / PWA FALLBACK (TESTING MODE) ───
        // Ye browser ki apni "Allow Notifications?" wali permission maangta hai
        if (!('Notification' in window)) {
            console.warn('Browser does not support notifications.');
            return;
        }

        // ─── PREMIUM BROWSER NOTIFICATION DESIGN ───
        // Ye parameters Chrome ko majboor karte hain ke wo notification ko "Massive Banner" ki tarah dikhaye
        const notificationOptions: any = {
            body: body,
            // High-resolution Premium Icon (KiryanaBook Green)
            icon: 'https://api.dicebear.com/7.x/shapes/svg?seed=KiryanaBook&backgroundColor=00E676',
            // 🔥 RICH MEDIA BANNER: System tray mein aik huge cinema-like image dikhenay ke liye!
            ...(id === 999 ? { image: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=800&q=80' } : {}),
            // Professional 5-step aggressive vibration for maximum impact
            vibrate: [300, 100, 300, 100, 600],
            // Allows the user to swipe it away manually
            requireInteraction: true,
            // Tag allows us to map the notification to a URL later
            data: { url: path }
        };


        // Function to trigger the actual notification visual
        const fireNotification = async () => {
             // 1. Try Premium Service Worker execution (Forces Android to use Native UI layout)
             if ('serviceWorker' in navigator) {
                 try {
                     await navigator.serviceWorker.register('/kiryana-sw.js');
                     // Wait for it to become ready to ensure it renders flawlessly
                     const readyReg = await navigator.serviceWorker.ready;
                     await readyReg.showNotification(title, notificationOptions);
                     return; // Success!
                 } catch (err) {
                     console.log('SW approach skipped, using basic API:', err);
                 }
             }
             // 2. Fallback to basic DOM execution
             new Notification(title, notificationOptions);
        };

        if (Notification.permission === 'granted') {
            await fireNotification();
        } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                await fireNotification();
            }
        }
    }
  } catch (err) {
    console.error('Notification Error:', err);
  }
};

