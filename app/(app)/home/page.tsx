import dynamic from 'next/dynamic';

// Extreme Optimization: Lazy load the heavy SearchFeed component
// This guarantees a lightning-fast First Contentful Paint (FCP)
const SearchFeed = dynamic(() => import('../../components/SearchFeed'), {
  loading: () => (
    <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}>
      <div className="skeleton" style={{ width: '100%', height: '200px', borderRadius: '12px' }}></div>
    </div>
  )
});

export default function Home() {
  return (
    <div>
      <section className="glass hero" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0, marginBottom: '0.5rem' }}>MiniTube</h1>
        <p style={{ margin: 0 }}>The absolute pinnacle of decentralized media.</p>
      </section>

      <SearchFeed />
    </div>
  );
}
