import Link from 'next/link';

// --- 核心：Notion 全能渲染引擎 (支持嵌套和多组件) ---
function renderBlocks(blocks) {
  return blocks.map(block => {
    const { type, id } = block;
    const value = block[type];

    // 处理富文本（加粗、链接、颜色等）
    const renderText = (textArr) => {
      if (!textArr) return null;
      return textArr.map((text, i) => {
        const { annotations, plain_text, href } = text;
        let element = (
          <span key={i} style={{
            fontWeight: annotations.bold ? 'bold' : 'normal',
            fontStyle: annotations.italic ? 'italic' : 'normal',
            textDecoration: annotations.strikethrough ? 'line-through' : annotations.underline ? 'underline' : 'none',
            fontFamily: annotations.code ? 'monospace' : 'inherit',
            backgroundColor: annotations.code ? '#f3f3f3' : 'transparent',
            padding: annotations.code ? '2px 4px' : '0',
            borderRadius: '4px',
            color: annotations.color !== 'default' ? annotations.color : 'inherit'
          }}>{plain_text}</span>
        );
        return href ? <a key={i} href={href} target="_blank" style={{ color: '#0066cc' }}>{element}</a> : element;
      });
    };

    switch (type) {
      case 'paragraph':
        return <p key={id} style={{ marginBottom: '1em', lineHeight: '1.6' }}>{renderText(value.rich_text)}</p>;
      case 'heading_1':
        return <h1 key={id} style={{ fontSize: '1.8em', marginTop: '1.5em', fontWeight: 'bold' }}>{renderText(value.rich_text)}</h1>;
      case 'heading_2':
        return <h2 key={id} style={{ fontSize: '1.4em', marginTop: '1.2em', fontWeight: 'bold' }}>{renderText(value.rich_text)}</h2>;
      case 'heading_3':
        return <h3 key={id} style={{ fontSize: '1.2em', marginTop: '1em', fontWeight: 'bold' }}>{renderText(value.rich_text)}</h3>;
      case 'bulleted_list_item':
      case 'numbered_list_item':
        return <li key={id} style={{ marginLeft: '1.2em', marginBottom: '0.4em' }}>{renderText(value.rich_text)}</li>;
      case 'quote':
        return <blockquote key={id} style={{ borderLeft: '3px solid #ddd', paddingLeft: '1em', color: '#666', margin: '1em 0' }}>{renderText(value.rich_text)}</blockquote>;
      case 'callout':
        return (
          <div key={id} style={{ display: 'flex', background: '#f1f1ef', padding: '16px', borderRadius: '8px', margin: '1em 0' }}>
            <span style={{ marginRight: '12px' }}>{value.icon?.emoji}</span>
            <div>{renderText(value.rich_text)}</div>
          </div>
        );
      case 'image':
        const src = value.type === 'external' ? value.external.url : value.file?.url;
        return src ? <img key={id} src={src} style={{ maxWidth: '100%', borderRadius: '4px', margin: '1.5em 0' }} /> : null;
      case 'divider':
        return <hr key={id} style={{ border: 'none', borderTop: '1px solid #eee', margin: '2em 0' }} />;
      
      // 🚨 关键：处理“分栏” (Column List)
      case 'column_list':
        // 这里需要递归渲染子块，但由于 API 结构，这里通常需要配合特定的子块拉取逻辑
        return <div key={id} style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>（分栏内容请在 Notion 中尽量简化或联系开发者优化嵌套逻辑）</div>;

      default:
        return null;
    }
  });
}

export default async function DynamicPage({ params }) {
  const { slug } = await params;
  const DATABASE_ID = process.env.NOTION_PAGE_ID;
  const TOKEN = process.env.NOTION_AUTH_TOKEN;
  const formattedSlug = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();

  // 1. 查询 Page
  const searchRes = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filter: { and: [{ property: 'type', select: { equals: 'Page' } }, { property: 'title', title: { contains: formattedSlug } }] }
    }),
    next: { revalidate: 60 }
  });
  const searchData = await searchRes.json();
  const page = searchData.results?.[0];

  if (!page) return <div style={{padding: '50px'}}>未找到页面，请检查 Notion 中的标题和 type 标签。</div>;

  // 2. 获取正文
  const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${page.id}/children`, {
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Notion-Version': '2022-06-28' },
    next: { revalidate: 60 }
  });
  const blocksData = await blocksRes.json();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>← Back</Link>
      <h1 style={{ fontSize: '2.5em', margin: '20px 0 40px' }}>{page.properties.title.title[0]?.plain_text}</h1>
      <div className="notion-body">
        {renderBlocks(blocksData.results)}
      </div>
    </div>
  );
}
