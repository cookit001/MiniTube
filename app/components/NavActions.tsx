'use client';

import React, { useState, useEffect } from 'react';
import NotificationCenter from './NotificationCenter';
import { getUnreadCount } from '../utils/notificationEngine';

export default function NavActions() {
  const [showNotifs, setShowNotifs] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    // Initial fetch
    setUnread(getUnreadCount());

    // Listen for updates
    const handleUpdate = () => {
      setUnread(getUnreadCount());
    };
    window.addEventListener('minitube_notifications_updated', handleUpdate);

    return () => window.removeEventListener('minitube_notifications_updated', handleUpdate);
  }, []);

  const toggleNotifs = () => {
    setShowNotifs(!showNotifs);
    if (!showNotifs) {
      // Clear unread count optimistically when opened
      setUnread(0);
    }
  };

  return (
    <div className="nav-actions">
      <button className="bell-btn" onClick={toggleNotifs}>
        🔔
        {unread > 0 && <span className="unread-dot"></span>}
      </button>

      {showNotifs && <NotificationCenter onClose={() => setShowNotifs(false)} />}

      <style jsx>{`
        .nav-actions {
          position: relative;
          display: flex;
          align-items: center;
        }

        .bell-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
          position: relative;
          transition: all 0.2s;
        }

        .bell-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.05);
        }

        .unread-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background-color: #ff2a2a;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(255, 42, 42, 0.8);
        }
      `}</style>
    </div>
  );
}
