export default async function DynamicPage({ params }) {
  const { slug } = await params;
  const DATABASE_ID = process.env.NOTION_PAGE_ID;
  const TOKEN = process.env.NOTION_AUTH_TOKEN;

  // 1. 尝试多种大小写组合去匹配标题 (About, about, ABOUT)
  const possibleTitles = [
    slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase(),
    slug.toLowerCase(),
    slug.toUpperCase()
  ];

  // 2. 去 Notion 数据库搜索
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
          { property: 'type', select: { equals: 'Page' } }, // 确保 type 列是 Page
          {
            or: possibleTitles.map(t => ({
              property: 'title',
              title: { contains: t }
            }))
          }
        ]
      }
    }),
    next: { revalidate: 60 }
  });

  const searchData = await searchRes.json();
  const page = searchData.results?.[0];

  // 如果搜不到，显示一个调试界面，帮我们看看到底哪错了
  if (!page) {
    return (
      <div style={{ padding: '50px', color: '#666' }}>
        <h2>🔍 页面未找到 (404)</h2>
        <p>正尝试访问的路径 (slug): <strong>{slug}</strong></p>
        <p>请检查 Notion 数据库中是否有一行数据满足：</p>
        <ul>
          <li><strong>title</strong> 列包含 "{possibleTitles[0]}"</li>
          <li><strong>type</strong> 列的标签是 "Page" (注意大小写)</li>
        </ul>
      </div>
    );
  }

  // 3. 抓取正文块
  const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${page.id}/children?page_size=100`, {
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Notion-Version': '2022-06-28' },
  });
  const blocksData = await blocksRes.json();

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', paddingBottom: '80px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '40px' }}>
        {page.properties.title?.title[0]?.plain_text}
      </h1>
      <div style={{ lineHeight: '1.8' }}>
        {blocksData.results?.map((block) => {
          // 极简渲染逻辑：只渲染段落
          if (block.type === 'paragraph') {
            return <p key={block.id} style={{ marginBottom: '16px' }}>
              {block.paragraph.rich_text.map(t => t.plain_text).join('')}
            </p>;
          }
          return null;
        })}
      </div>
    </div>
  );
}
