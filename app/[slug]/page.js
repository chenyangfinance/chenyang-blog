import Link from 'next/link';

// 复用我们之前的渲染逻辑（支持段落、标题、图片、代码块）
function renderBlock(block) {
  const { type, id } = block;
  const value = block[type];
  const textContent = value?.rich_text?.map((text, i) => {
    let content = text.plain_text;
    if (text.annotations.bold) content = <strong key={i}>{content}</strong>;
    if (text.annotations.italic) content = <em key={i}>{content}</em>;
    if (text.annotations.code) content = <code key={i} style={{background: '#eee', padding: '2px 4px', borderRadius: '4px'}}>{content}</code>;
    return <span key={i}>{content}</span>;
  }) || [];

  switch (type) {
    case 'paragraph': return <p key={id} style={{ lineHeight: '1.8', marginBottom: '16px' }}>{textContent}</p>;
    case 'heading_1': return <h1 key={id} style={{ marginTop: '2em', fontSize: '28px' }}>{textContent}</h1>;
    case 'heading_2': return <h2 key={id} style={{ marginTop: '1.5em', fontSize: '24px' }}>{textContent}</h2>;
    case 'image': 
      const src = value.type === 'external' ? value.external.url : value.file.url;
      return <img key={id} src={src} style={{ maxWidth: '100%', borderRadius: '8px' }} />;
    default: return null;
  }
}

export default async function DynamicPage({ params }) {
  const { slug } = await params; // 这里的 slug 就是网址里的 about 或 research
  const DATABASE_ID = process.env.NOTION_PAGE_ID;
  const TOKEN = process.env.NOTION_AUTH_TOKEN;

  // 1. 去 Notion 搜：type 是 Page，且标题包含网址里的这个词
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
          { property: 'title', title: { contains: slug.charAt(0).toUpperCase() + slug.slice(1) } } // 自动首字母大写匹配
        ]
      }
    }),
    next: { revalidate: 60 }
  });

  const searchData = await searchRes.json();
  const page = searchData.results[0];

  if (!page) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>
      <h2>404 - 页面未找到</h2>
      <p>请确认 Notion 中有一篇 type 为 Page 且标题包含 "{slug}" 的文章。</p>
    </div>;
  }

  // 2. 抓取正文
  const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${page.id}/children`, {
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Notion-Version': '2022-06-28' },
    next: { revalidate: 60 }
  });
  const blocksData = await blocksRes.json();

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', paddingBottom: '80px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '40px' }}>
        {page.properties.title.title[0]?.plain_text}
      </h1>
      <div>
        {blocksData.results.map(block => renderBlock(block))}
      </div>
    </div>
  );
}
