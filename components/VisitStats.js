'use client';

import { useEffect, useState } from 'react';

export default function VisitStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const countedKey = 'chenyang-site-visit-counted';
    let counted = false;

    try {
      counted = sessionStorage.getItem(countedKey) === 'true';
    } catch {}

    fetch('/api/visits', { method: counted ? 'GET' : 'POST' })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!data?.configured) return;
        try {
          sessionStorage.setItem(countedKey, 'true');
        } catch {}
        setStats(data);
      })
      .catch(() => {});
  }, []);

  if (!stats) return null;

  const locations = stats.locations || [];

  return (
    <section style={{
      marginTop: '64px',
      paddingTop: '20px',
      borderTop: '1px solid #f0f0f0',
      color: '#86868b',
      fontSize: '13px',
      lineHeight: 1.5
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', alignItems: 'center' }}>
        <span>Total visits: {stats.total?.toLocaleString()}</span>
        {locations.length > 0 && (
          <span>
            Top locations: {locations.map((item) => `${item.location} ${item.visits}`).join(' · ')}
          </span>
        )}
      </div>
    </section>
  );
}
