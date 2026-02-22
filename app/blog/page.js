import Link from 'next/link';

export default async function BlogListPage() {
  const DATABASE_ID = process.env.NOTION_PAGE_ID;
  const TOKEN = process.env.NOTION_AUTH_TOKEN;

  const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filter: { property: 'type', select: { equals: 'Post' } },
      sorts: [{ property: 'date', direction: 'descending' }],
    }),
    next: { revalidate: 60 },
  });

  const data = await res.json();
  const posts = data.results || [];

  return (
    <div>
      <h1 style={{ fontSize: '2.5em', fontWeight: '800', marginBottom: '40px', letterSpacing: '-0.03em' }}>Blog</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {posts.map((post) => (
          <li key={post.id} style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column' }}>
            <Link href={`/post/${post.id}`} style={{ fontSize: '18px', color: '#0066cc', textDecoration: 'none', fontWeight: '500' }}>
              {post.properties.title.title[0]?.plain_text || 'Untitled'}
            </Link>
            <span style={{ color: '#999', fontSize: '14px', marginTop: '5px' }}>
              {post.properties.date?.date?.start || 'No Date'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
