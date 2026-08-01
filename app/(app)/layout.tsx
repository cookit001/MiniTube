import '../globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import FarcasterGate from '../components/FarcasterGate';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-container">
      <nav className="glass main-nav">
        <div className="logo">
          <span className="logo-dot"></span>
          MiniTube
        </div>
      </nav>
      
      <aside className="sidebar">
        <Link href="/home" className="sidebar-link">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          Home
        </Link>
        <Link href="/shorts" className="sidebar-link">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
          Shorts
        </Link>
        <Link href="/farcaster-watch" className="sidebar-link">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          Farcaster Watch
        </Link>
        <Link href="/live" className="sidebar-link">
          <span className="live-badge"></span>
          Live
        </Link>
      </aside>

      <main className="content-wrapper">
        {children}
        <FarcasterGate />
      </main>
    </div>
  );
}
