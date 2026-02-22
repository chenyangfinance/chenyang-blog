import Link from 'next/link';

export default async function HomePage() {
  const DATABASE_ID = process.env.NOTION_PAGE_ID;
  const TOKEN = process.env.NOTION_AUTH_TOKEN;

  const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sorts: [{ timestamp: 'created_time', direction: 'descending' }]
    }),
    next: { revalidate: 60 }
  });

  if (!res.ok) return <div style={{ color: 'red' }}>数据加载失败，请检查连接。</div>;

  const data = await res.json();
  const posts = data.results || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {posts.map((post) => {
        const titleKeys = Object.keys(post.properties).filter(k => post.properties[k].type === 'title');
        const titleProp = titleKeys.length > 0 ? post.properties[titleKeys[0]] : null;
        const titleText = titleProp?.title?.[0]?.plain_text || '未命名文章';

        const dateKeys = Object.keys(post.properties).filter(k => post.properties[k].type === 'date');
        let dateText = post.created_time.substring(0, 10); 
        if (dateKeys.length > 0 && post.properties[dateKeys[0]].date) {
          dateText = post.properties[dateKeys[0]].date.start;
        }

        return (
          <div key={post.id} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'baseline',
            borderBottom: '1px solid #eaeaea',
            paddingBottom: '15px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '500', margin: 0, letterSpacing: '0.5px' }}>
              {/* 🚨 变化在这里：加上了可点击的 Link，跳转路径是文章的 id */}
              <Link href={`/${post.id}`} style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                {titleText}
              </Link>
            </h2>
            <span style={{ color: '#888', fontSize: '14px', fontFamily: 'monospace' }}>
              {dateText}
            </span>
          </div>
        )
      })}
    </div>
  );
}
