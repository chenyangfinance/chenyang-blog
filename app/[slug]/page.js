export default async function DynamicPage({ params }) {
  const { slug } = await params;
  const DATABASE_ID = process.env.NOTION_PAGE_ID;
  const TOKEN = process.env.NOTION_AUTH_TOKEN;

  // 1. 更加精准的搜索：首字母大写转换
  const formattedSlug = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();

  const searchRes = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filter: {
        and: [
          { property: 'type', select: { equals: 'Page' } },
          { property: 'title', title: { contains: formattedSlug } }
        ]
      }
    }),
    next: { revalidate: 60 }
  });

  const searchData = await searchRes.json();
  
  // 🚨 关键：如果没有搜到页面，返回一个友好的提示而不是让系统崩溃
  if (!searchData.results || searchData.results.length === 0) {
    return <div style={{padding: '50px'}}>未找到标题为 "{formattedSlug}" 且 type 为 Page 的文章。</div>;
  }

  const page = searchData.results[0];

  // 2. 抓取正文 (加上容错)
  const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${page.id}/children`, {
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Notion-Version': '2022-06-28' },
  });
  
  const blocksData = await blocksRes.json();
  const blocks = blocksData.results || [];

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '40px' }}>
        {page.properties.title?.title[0]?.plain_text || slug}
      </h1>
      <div>
        {blocks.map(block => (
          <p key={block.id} style={{marginBottom: '15px', lineHeight: '1.8'}}>
            {block.paragraph?.rich_text?.[0]?.plain_text}
          </p>
        ))}
      </div>
    </div>
  );
}
