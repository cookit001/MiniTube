'use client';

import React, { useState, useEffect } from 'react';
import { getNotifications, AppNotification, markAllAsRead, syncLiveNotifications } from '../utils/notificationEngine';
import sdk from '@farcaster/frame-sdk';

export default function NotificationCenter({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial local notifications
    const localNotifs = getNotifications();
    setNotifications(localNotifs);

    // Fetch API notifications
    const fetchApiNotifs = async () => {
      try {
        await syncLiveNotifications(); // Sync global Redis notifications first
        
        let fid = null;
        try {
          const ctx = await sdk.context;
          if (ctx?.user?.fid) fid = ctx.user.fid;
        } catch (e) {
          // ignore
        }

        const res = await fetch(`/api/notifications${fid ? `?fid=${fid}` : ''}`);
        const data = await res.json();
        if (data.success && data.data) {
          // Merge and deduplicate by id
          setNotifications(prev => {
            const merged = [...data.data, ...prev];
            const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
            return unique.sort((a, b) => b.timestamp - a.timestamp);
          });
        }
      } catch (e) {
        console.error("Failed to fetch notifications:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchApiNotifs();

    // Listen for local pushes
    const handleUpdate = () => {
      setNotifications(getNotifications());
    };
    window.addEventListener('minitube_notifications_updated', handleUpdate);
    
    // Mark as read when opened
    markAllAsRead();

    return () => {
      window.removeEventListener('minitube_notifications_updated', handleUpdate);
    };
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'new_video': return '🎥';
      case 'reply': return '💬';
      case 'like': return '❤️';
      case 'tip': return '💸';
      default: return '🔔';
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <h3>Notifications</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      
      <div className="notification-list">
        {loading ? (
          <div className="notification-empty">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="notification-empty">You're all caught up! 🎈</div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`notification-item ${!n.read ? 'unread' : ''}`}>
              <div className="notification-icon">{getIcon(n.type)}</div>
              <div className="notification-content">
                <p>{n.message}</p>
                <span className="notification-time">{getTimeAgo(n.timestamp)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .notification-panel {
          position: absolute;
          top: 60px;
          right: 20px;
          width: 340px;
          max-height: 500px;
          background: rgba(15, 15, 15, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          overflow: hidden;
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .notification-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          color: #aaa;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: white;
        }

        .notification-list {
          overflow-y: auto;
          flex: 1;
        }

        .notification-item {
          display: flex;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          gap: 14px;
          transition: background 0.2s;
          cursor: pointer;
        }

        .notification-item:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .notification-item.unread {
          background: rgba(255, 42, 42, 0.05);
        }

        .notification-icon {
          font-size: 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .notification-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .notification-content p {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.4;
          color: #eee;
        }

        .notification-time {
          font-size: 0.75rem;
          color: #888;
        }

        .notification-empty {
          padding: 40px 20px;
          text-align: center;
          color: #888;
          font-size: 0.9rem;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 768px) {
          .notification-panel {
            position: fixed;
            top: 70px; /* Below top nav */
            right: 0;
            left: 0;
            width: 100%;
            height: calc(100vh - 70px);
            max-height: none;
            border-radius: 0;
            border: none;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }
        }
      `}</style>
    </div>
  );
}
