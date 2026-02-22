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
      filter: {
        and: [
          { property: 'status', select: { equals: 'Published' } },
          { property: 'type', select: { equals: 'Post' } }
        ]
      },
      sorts: [{ timestamp: 'created_time', direction: 'descending' }]
    }),
    next: { revalidate: 60 }
  });

  const data = await res.json();
  const posts = data.results || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {posts.map((post) => {
        const titleText = post.properties.title?.title[0]?.plain_text || "无标题";
        return (
          <div key={post.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
            <h2 style={{ fontSize: '18px', margin: 0 }}>
              {/* 🚨 核心：确保这里链接到了 /post/[id] */}
              <Link href={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {titleText}
              </Link>
            </h2>
          </div>
        )
      })}
    </div>
  );
}
