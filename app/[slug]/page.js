import Link from 'next/link';

// --- 1. 递归渲染引擎：支持分栏和嵌套 ---
async function NotionRenderer({ blockId, token }) {
  // 获取子节点内容
  const res = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Notion-Version': '2022-06-28' },
    next: { revalidate: 60 }
  });
  const data = await res.json();
  const blocks = data.results || [];

  const renderText = (textArr) => {
    if (!textArr) return null;
    return textArr.map((text, i) => {
      const { annotations, plain_text, href } = text;
      let element = <span key={i} style={{
        fontWeight: annotations.bold ? 'bold' : 'normal',
        fontStyle: annotations.italic ? 'italic' : 'normal',
        fontFamily: annotations.code ? 'monospace' : 'inherit',
        backgroundColor: annotations.code ? '#f3f3f3' : 'transparent',
        padding: annotations.code ? '2px 4px' : '0',
        borderRadius: '4px',
        color: annotations.color !== 'default' ? annotations.color : 'inherit'
      }}>{plain_text}</span>;
      return href ? <a key={i} href={href} target="_blank" style={{ color: '#0066cc' }}>{element}</a> : element;
    });
  };

  return (
    <>
      {blocks.map((block) => {
        const { type, id } = block;
        const value = block[type];

        switch (type) {
          case 'paragraph':
            return <p key={id} style={{ marginBottom: '1em', lineHeight: '1.6' }}>{renderText(value.rich_text)}</p>;
          case 'heading_1':
            return <h1 key={id} style={{ fontSize: '1.8em', marginTop: '1.5em', fontWeight: 'bold' }}>{renderText(value.rich_text)}</h1>;
          case 'heading_2':
            return <h2 key={id} style={{ fontSize: '1.4em', marginTop: '1.2em', fontWeight: 'bold' }}>{renderText(value.rich_text)}</h2>;
          case 'heading_3':
            return <h3 key={id} style={{ fontSize: '1.1em', marginTop: '1em', fontWeight: 'bold' }}>{renderText(value.rich_text)}</h3>;
          case 'bulleted_list_item':
            return <li key={id} style={{ marginLeft: '1.2em' }}>{renderText(value.rich_text)}</li>;
          case 'image':
            const src = value.type === 'external' ? value.external.url : value.file?.url;
            return src ? <img key={id} src={src} style={{ maxWidth: '100%', borderRadius: '8px', margin: '1em 0' }} /> : null;
          
          // 🚨 关键：处理分栏列表
          case 'column_list':
            return (
              <div key={id} style={{ display: 'flex', gap: '20px', width: '100%', flexWrap: 'wrap', margin: '2em 0' }}>
                <NotionRenderer blockId={id} token={token} />
              </div>
            );
          
          // 🚨 关键：处理单列
          case 'column':
            return (
              <div key={id} style={{ flex: 1, minWidth: '250px' }}>
                <NotionRenderer blockId={id} token={token} />
              </div>
            );

          case 'callout':
            return (
              <div key={id} style={{ display: 'flex', background: '#f1f1ef', padding: '16px', borderRadius: '8px', margin: '1em 0' }}>
                <span style={{ marginRight: '12px' }}>{value.icon?.emoji}</span>
                <div>{renderText(value.rich_text)}</div>
              </div>
            );

          default:
            return null;
        }
      })}
    </>
  );
}

// --- 2. 页面主逻辑 ---
export default async function DynamicPage({ params }) {
  const { slug } = await params;
  const DATABASE_ID = process.env.NOTION_PAGE_ID;
  const TOKEN = process.env.NOTION_AUTH_TOKEN;
  const formattedSlug = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();

  const searchRes = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filter: { and: [{ property: 'type', select: { equals: 'Page' } }, { property: 'title', title: { contains: formattedSlug } }] }
    }),
  });
  const searchData = await searchRes.json();
  const page = searchData.results?.[0];

  if (!page) return <div style={{padding: '50px'}}>未找到页面，请检查 Notion 标题。</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>← Back</Link>
      <h1 style={{ fontSize: '2.5em', margin: '20px 0 40px' }}>{page.properties.title.title[0]?.plain_text}</h1>
      
      {/* 使用递归渲染引擎 */}
      <NotionRenderer blockId={page.id} token={TOKEN} />
    </div>
  );
}
