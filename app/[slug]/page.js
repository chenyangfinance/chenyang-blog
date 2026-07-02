import Link from 'next/link';
import NotionRenderer from '../../components/NotionRenderer';

export default async function DynamicPage({ params }) {
  // 🚨 关键修复：在 Next.js 最新版中，必须 await params 才能拿到真实的 slug
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  const DATABASE_ID = process.env.NOTION_PAGE_ID;
  const TOKEN = process.env.NOTION_AUTH_TOKEN;

  const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filter: {
        and: [
          { property: 'type', select: { equals: 'Page' } },
          { property: 'slug', rich_text: { equals: slug } }
        ]
      }
    }),
    next: { revalidate: 60 }
  });

  const searchData = await res.json();
  const page = searchData.results?.[0];

  if (!page) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>🔍 找不到 "{slug}" 页面</h2>
        <p style={{ color: '#666', marginTop: '20px' }}>请检查 Notion 数据库中是否有一行数据的 slug 为 "{slug}"</p>
        <Link href="/" style={{ color: '#0066cc', marginTop: '20px', display: 'inline-block' }}>返回首页</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <h1 style={{ fontSize: 'clamp(40px, 6vw, 52px)', fontWeight: 700, lineHeight: 1.08, marginBottom: '56px', letterSpacing: '-0.01em', color: '#000' }}>
        {page.properties.title.title[0]?.plain_text}
      </h1>
      <NotionRenderer blockId={page.id} token={TOKEN} />
    </div>
  );
}
