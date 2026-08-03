/**
 * MiniTube Notification Engine
 * Tracks notifications locally and syncs with Farcaster via API
 */

export type NotificationType = 'new_video' | 'reply' | 'like' | 'tip';

export interface AppNotification {
  id: string;
  type: NotificationType;
  actor: string;
  message: string;
  hash?: string; // Target cast hash for deep linking
  read: boolean;
  timestamp: number;
}

const STORAGE_KEY = 'minitube_notifications_v1';

export function getNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNotifications(notifications: AppNotification[]) {
  if (typeof window === 'undefined') return;
  try {
    // Sort descending by timestamp
    const sorted = [...notifications].sort((a, b) => b.timestamp - a.timestamp);
    // Keep max 100 to avoid bloat
    const trimmed = sorted.slice(0, 100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    
    // Dispatch custom event so React components can update
    window.dispatchEvent(new Event('minitube_notifications_updated'));
  } catch (e) {
    // Ignore Storage errors
  }
}

export function pushNotification(notif: Omit<AppNotification, 'id' | 'read' | 'timestamp'>) {
  const current = getNotifications();
  
  // Deduplicate: Don't push if we already have this exact notification from this actor for this hash recently
  const isDuplicate = current.some(n => 
    n.type === notif.type && 
    n.actor === notif.actor && 
    n.hash === notif.hash &&
    Date.now() - n.timestamp < 1000 * 60 * 60 * 24 // within 24 hours
  );
  
  if (isDuplicate) return;

  const newNotif: AppNotification = {
    ...notif,
    id: Math.random().toString(36).substring(2, 9),
    read: false,
    timestamp: Date.now()
  };
  
  saveNotifications([newNotif, ...current]);
}

export function markAllAsRead() {
  const current = getNotifications();
  const updated = current.map(n => ({ ...n, read: true }));
  saveNotifications(updated);
}

export function getUnreadCount(): number {
  return getNotifications().filter(n => !n.read).length;
}

/**
 * Checks a feed of casts against the user's followed accounts
 * and triggers 'new_video' notifications if they haven't been seen yet.
 */
export function checkFeedForFollowedCreators(feedCasts: any[], follows: Set<string>) {
  if (typeof window === 'undefined') return;
  if (follows.size === 0) return;

  feedCasts.forEach(cast => {
    if (follows.has(cast.author)) {
      pushNotification({
        type: 'new_video',
        actor: cast.author,
        message: `@${cast.author} dropped a new video!`,
        hash: cast.hash
      });
    }
  });
}
