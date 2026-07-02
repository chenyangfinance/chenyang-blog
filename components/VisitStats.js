'use client';

import { useEffect, useState } from 'react';

const colors = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0891b2', '#ca8a04', '#be185d'];

function flagEmoji(code) {
  if (!code || code === 'Unknown' || code.length !== 2) return '◼';

  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt()));
}

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
  const countries = stats.countries || [];
  const maxVisits = Math.max(...countries.map((item) => item.visits), 1);

  return (
    <section style={{
      marginTop: '64px',
      paddingTop: '24px',
      borderTop: '1px solid #f0f0f0',
      color: '#6b7280',
      fontSize: '14px',
      lineHeight: 1.5
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', alignItems: 'baseline' }}>
          <span style={{ color: '#111827', fontWeight: 600 }}>Total visits: {stats.total?.toLocaleString()}</span>
          <span>Visitors by country</span>
        </div>

        {countries.length > 0 ? (
          <div style={{ display: 'grid', gap: '10px' }}>
            {countries.map((item, index) => {
              const width = `${Math.max(12, Math.round((item.visits / maxVisits) * 100))}%`;
              const color = colors[index % colors.length];

              return (
                <div key={item.code} style={{ display: 'grid', gridTemplateColumns: 'minmax(130px, 190px) 1fr auto', gap: '12px', alignItems: 'center' }}>
                  <span style={{ color: '#374151', whiteSpace: 'nowrap' }}>
                    <span style={{ marginRight: '8px' }}>{flagEmoji(item.code)}</span>
                    {item.name}
                  </span>
                  <span style={{ height: '8px', borderRadius: '999px', background: '#f3f4f6', overflow: 'hidden' }}>
                    <span style={{ display: 'block', width, height: '100%', borderRadius: '999px', background: color }} />
                  </span>
                  <span style={{ color: '#111827', fontVariantNumeric: 'tabular-nums' }}>{item.visits}</span>
                </div>
              );
            })}
          </div>
        ) : locations.length > 0 && (
          <div>
            Top locations: {locations.map((item) => `${item.location} ${item.visits}`).join(' · ')}
          </div>
        )}
      </div>
    </section>
  );
}
