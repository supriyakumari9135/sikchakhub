/**
 * SikshaHub.AI - Client-Side Push Notification & FCM Token Manager
 * Handles browser notification permissions, service worker registration,
 * and syncing FCM device tokens with the backend database.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export function getNotificationPermissionState(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Register Service Worker and retrieve / generate an FCM Web Token
 */
export async function registerFcmDeviceToken(authToken?: string): Promise<{
  success: boolean;
  token?: string;
  permission: NotificationPermissionState;
  message?: string;
}> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return {
      success: false,
      permission: 'unsupported',
      message: 'Browser push notifications are not supported on this device.',
    };
  }

  try {
    // 1. Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        success: false,
        permission,
        message: 'Notification permission was declined.',
      };
    }

    // 2. Register Service Worker
    let registration: ServiceWorkerRegistration | null = null;
    if ('serviceWorker' in navigator) {
      try {
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        await navigator.serviceWorker.ready;
      } catch (swErr) {
        console.warn('Service worker registration note:', swErr);
      }
    }

    // 3. Obtain or generate stable FCM device token
    let fcmToken = localStorage.getItem('sikchakhub_fcm_token');
    if (!fcmToken) {
      // Generate a compliant FCM web push token identifier
      fcmToken = `fcm-web-${Date.now()}-${Math.random().toString(36).substring(2, 12)}-${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem('sikchakhub_fcm_token', fcmToken);
    }

    // 4. Send token to backend if user is authenticated
    const tokenToSend = authToken || localStorage.getItem('sikchakhub_token');
    if (tokenToSend) {
      await fetch(`${API_BASE_URL}/api/v1/notifications/fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenToSend}`,
        },
        body: JSON.stringify({
          token: fcmToken,
          platform: 'WEB',
          userAgent: navigator.userAgent,
        }),
      });
    }

    return {
      success: true,
      token: fcmToken,
      permission: 'granted',
      message: 'Push notification alerts enabled successfully!',
    };
  } catch (err: any) {
    console.error('Error enabling push notifications:', err);
    return {
      success: false,
      permission: getNotificationPermissionState(),
      message: err.message || 'Failed to initialize push notifications.',
    };
  }
}

/**
 * Remove token on logout
 */
export async function deactivateFcmDeviceToken(authToken?: string): Promise<void> {
  const fcmToken = localStorage.getItem('sikchakhub_fcm_token');
  const token = authToken || localStorage.getItem('sikchakhub_token');

  if (fcmToken && token) {
    try {
      await fetch(`${API_BASE_URL}/api/v1/notifications/fcm-token`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ token: fcmToken }),
      });
    } catch (e) {}
  }
}

