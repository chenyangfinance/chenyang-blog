import Link from 'next/link';
import NotionRenderer from '../../../components/NotionRenderer';

export default async function PostPage({ params }) {
  const { id } = params;
  const TOKEN = process.env.NOTION_AUTH_TOKEN;

  // 获取页面属性（标题、日期等）
  const pageRes = await fetch(`https://api.notion.com/v1/pages/${id}`, {
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Notion-Version': '2022-06-28' },
    next: { revalidate: 60 }
  });
  const page = await pageRes.json();

  return (
    <div>
      <nav style={{ marginBottom: '40px' }}>
        <Link href="/blog" style={{ color: '#999', textDecoration: 'none', fontSize: '14px' }}>← Back to Blog</Link>
      </nav>
      
      <h1 style={{ fontSize: '2.5em', fontWeight: '800', marginBottom: '10px', letterSpacing: '-0.03em' }}>
        {page.properties?.title?.title[0]?.plain_text || 'Untitled'}
      </h1>
      
      <div style={{ color: '#999', fontSize: '14px', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
        {page.properties?.date?.date?.start || 'No Date'}
      </div>

      <NotionRenderer blockId={id} token={TOKEN} />
    </div>
  );
}
