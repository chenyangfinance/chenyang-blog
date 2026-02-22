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
      filter: {
        and: [
          { property: 'status', select: { equals: 'Published' } },
          { property: 'type', select: { equals: 'Post' } }
        ]
      },
      sorts: [
        { property: 'date', direction: 'descending' }
      ]
    }),
    next: { revalidate: 60 }
  });

  if (!res.ok) {
    return <div style={{ color: 'red' }}>数据加载失败，请检查 Vercel 环境变量里的 Token 或 ID 是否填对。</div>;
  }

  const data = await res.json();
  const posts = data.results || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {posts.length === 0 && <p style={{ color: '#999' }}>还没有发布的文章，请检查 Notion 状态是否为 Published</p>}
      
      {posts.map((post) => (
        <div key={post.id} style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'baseline',
          borderBottom: '1px solid #f9f9f9',
          paddingBottom: '10px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '400', margin: 0 }}>
            {post.properties.title?.title[0]?.plain_text || '无标题'}
          </h2>
          <span style={{ color: '#aaa', fontSize: '14px' }}>
            {post.properties.date?.date?.start || ''}
          </span>
        </div>
      ))}
    </div>
  );
}
