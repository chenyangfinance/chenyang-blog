import Link from 'next/link';
// 这里假设你的 NotionRenderer 已经写在组件里，或者你需要从之前的代码复制过来
// 如果你之前把 NotionRenderer 放在了 app/[slug]/page.js，记得也复制一份到这里

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
        borderRadius: '4px'
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
            return <p key={id} style={{ marginBottom: '1.2em' }}>{renderText(value.rich_text)}</p>;
          case 'heading_1':
            return <h1 key={id} style={{ fontSize: '1.8em', marginTop: '1.5em', fontWeight: 'bold' }}>{renderText(value.rich_text)}</h1>;
          case 'image':
            const src = value.type === 'external' ? value.external.url : value.file?.url;
            return src ? (
              <div style={{ margin: '1.5em 0', textAlign: 'center' }}>
                <img src={src} style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px' }} />
              </div>
            ) : null;
          case 'column_list':
            return <div key={id} style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', margin: '2em 0' }}><NotionRenderer blockId={id} token={token} /></div>;
          case 'column':
            return <div key={id} style={{ flex: 1, minWidth: '300px' }}><NotionRenderer blockId={id} token={token} /></div>;
          default:
            return null;
        }
      })}
    </>
  );
}

export default async function HomePage() {
  const DATABASE_ID = process.env.NOTION_PAGE_ID;
  const TOKEN = process.env.NOTION_AUTH_TOKEN;

  // 🚨 强制获取 slug 为 about 的页面
  const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filter: {
        and: [
          { property: 'type', select: { equals: 'Page' } },
          { property: 'slug', rich_text: { equals: 'about' } }
        ]
      }
    }),
  });

  const searchData = await res.json();
  const page = searchData.results?.[0];

  if (!page) return <div>Loading About Page...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '2.5em', fontWeight: '800', marginBottom: '30px', letterSpacing: '-0.02em' }}>
        {page.properties.title.title[0]?.plain_text}
      </h1>
      <NotionRenderer blockId={page.id} token={TOKEN} />
    </div>
  );
}
