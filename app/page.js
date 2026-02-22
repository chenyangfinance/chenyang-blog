import NotionRenderer from '../components/NotionRenderer';

export default async function HomePage() {
  const DATABASE_ID = process.env.NOTION_PAGE_ID;
  const TOKEN = process.env.NOTION_AUTH_TOKEN;

  // 抓取 slug 为 index 的数据
  const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filter: {
        and: [
          { property: 'type', select: { equals: 'Page' } },
          { property: 'slug', rich_text: { equals: 'index' } } // 🚨 对应你在 Notion 刚改的 index
        ]
      }
    }),
    next: { revalidate: 60 }
  });

  const searchData = await res.json();
  const page = searchData.results?.[0];

  if (!page) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading About data or Cannot find page with slug "index"...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '2.5em', fontWeight: '800', marginBottom: '30px', letterSpacing: '-0.03em' }}>
        {page.properties.title.title[0]?.plain_text}
      </h1>
      <NotionRenderer blockId={page.id} token={TOKEN} />
    </div>
  );
}
