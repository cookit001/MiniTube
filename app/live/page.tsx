import YouTubeLiveFeed from '../components/YouTubeLiveFeed';

export default function LivePage() {
  return (
    <div>
      <section className="glass hero" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0, marginBottom: '0.5rem' }}>Live Streams</h1>
        <p style={{ margin: 0 }}>Discover live breaking news, gaming, and broadcasts.</p>
      </section>

      <YouTubeLiveFeed />
    </div>
  );
}
