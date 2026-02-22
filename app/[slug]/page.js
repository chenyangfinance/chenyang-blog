import Link from 'next/link';

// --- 1. 递归渲染核心：不仅支持基础块，还支持分栏和列表嵌套 ---
async function NotionRenderer({ blockId, token }) {
  const res = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children?page_size=100`, {
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
      return href ? <a key={i} href={href} target="_blank" style={{ color: '#0066cc', textDecoration: 'underline' }}>{element}</a> : element;
    });
  };

  return (
    <>
      {blocks.map((block) => {
        const { type, id } = block;
        const value = block[type];

        switch (type) {
          case 'paragraph':
            return <p key={id} style={{ marginBottom: '1.2em', lineHeight: '1.8' }}>{renderText(value.rich_text)}</p>;
          case 'heading_1':
            return <h1 key={id} style={{ fontSize: '1.8em', marginTop: '1.5em', fontWeight: 'bold' }}>{renderText(value.rich_text)}</h1>;
          case 'heading_2':
            return <h2 key={id} style={{ fontSize: '1.4em', marginTop: '1.2em', fontWeight: 'bold' }}>{renderText(value.rich_text)}</h2>;
          case 'heading_3':
            return <h3 key={id} style={{ fontSize: '1.1em', marginTop: '1em', fontWeight: 'bold' }}>{renderText(value.rich_text)}</h3>;
          case 'bulleted_list_item':
          case 'numbered_list_item':
            return <li key={id} style={{ marginLeft: '1.2em', marginBottom: '0.5em' }}>{renderText(value.rich_text)}</li>;
          case 'image':
            const src = value.type === 'external' ? value.external.url : value.file?.url;
            return src ? <img key={id} src={src} style={{ maxWidth: '100%', borderRadius: '8px', margin: '1em 0', display: 'block' }} /> : null;
          
          // 🚨 处理分栏布局：递归调用自己去渲染每一列的内容
          case 'column_list':
            return (
              <div key={id} style={{ display: 'flex', gap: '30px', width: '100%', flexWrap: 'wrap', margin: '2em 0' }}>
                <NotionRenderer blockId={id} token={token} />
              </div>
            );
          case 'column':
            return (
              <div key={id} style={{ flex: 1, minWidth: '300px' }}>
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
          case 'divider':
            return <hr key={id} style={{ border: 'none', borderTop: '1px solid #eee', margin: '2em 0' }} />;
          default:
            return null;
        }
      })}
    </>
  );
}

// --- 2. 页面主逻辑：改为通过 slug 属性匹配，更精准 ---
export default async function DynamicPage({ params }) {
  const { slug } = await params;
  const DATABASE_ID = process.env.NOTION_PAGE_ID;
  const TOKEN = process.env.NOTION_AUTH_TOKEN;

  // 💡 策略调整：优先通过 Notion 里的 slug 属性匹配，找不到再按标题匹配
  const searchRes = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filter: {
        and: [
          { property: 'type', select: { equals: 'Page' } },
          {
            or: [
              { property: 'slug', rich_text: { equals: slug.toLowerCase() } },
              { property: 'title', title: { contains: slug } }
            ]
          }
        ]
      }
    }),
  });
  
  const searchData = await searchRes.json();
  const page = searchData.results?.[0];

  if (!page) {
    return (
      <div style={{ maxWidth: '700px', margin: '100px auto', textAlign: 'center' }}>
        <h2>🔍 找不到 "{slug}" 页面</h2>
        <p>请确保 Notion 数据库中有一行满足：</p>
        <p>1. <strong>type</strong> 标签为 "Page"</p>
        <p>2. <strong>slug</strong> 属性为 "{slug.toLowerCase()}"</p>
        <Link href="/">返回首页</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <nav style={{ marginBottom: '30px' }}>
        <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>← Back to Home</Link>
      </nav>
      <h1 style={{ fontSize: '2.8em', fontWeight: 'bold', marginBottom: '40px' }}>
        {page.properties.title.title[0]?.plain_text}
      </h1>
      
      {/* 开启深度递归渲染 */}
      <NotionRenderer blockId={page.id} token={TOKEN} />
    </div>
  );
}
