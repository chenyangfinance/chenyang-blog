import Link from 'next/link';

// 这里放上面的 renderBlock 函数代码...

export default async function PostPage({ params }) {
  const { id } = await params;
  const TOKEN = process.env.NOTION_AUTH_TOKEN;

  // 1. 获取文章属性（标题等）
  const pageRes = await fetch(`https://api.notion.com/v1/pages/${id}`, {
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Notion-Version': '2022-06-28' },
  });
  
  // 2. 获取文章所有内容块
  const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${id}/children?page_size=100`, {
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Notion-Version': '2022-06-28' },
  });

  if (!pageRes.ok || !blocksRes.ok) return <div style={{padding: '50px'}}>加载失败</div>;

  const pageData = await pageRes.json();
  const blocksData = await blocksRes.json();

  // 获取标题
  const title = pageData.properties.title?.title[0]?.plain_text || "无标题";

  return (
    <article style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 20px' }}>
      <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>← Back</Link>
      <h1 style={{ fontSize: '2.5em', marginTop: '20px', marginBottom: '40px' }}>{title}</h1>
      <div>
        {blocksData.results.map(block => renderBlock(block))}
      </div>
    </article>
  );
}

function renderBlock(block) {
  const { type, id } = block;
  const value = block[type];

  // 1. 处理富文本（加粗、链接、颜色等）
  const renderText = (textArr) => {
    if (!textArr) return null;
    return textArr.map((text, i) => {
      const { annotations, plain_text, href } = text;
      let element = <span key={i} style={{
        fontWeight: annotations.bold ? 'bold' : 'normal',
        fontStyle: annotations.italic ? 'italic' : 'normal',
        textDecoration: annotations.strikethrough ? 'line-through' : annotations.underline ? 'underline' : 'none',
        fontFamily: annotations.code ? 'monospace' : 'inherit',
        backgroundColor: annotations.code ? '#f3f3f3' : 'transparent',
        padding: annotations.code ? '2px 4px' : '0',
        borderRadius: '4px',
        color: annotations.color !== 'default' ? annotations.color : 'inherit'
      }}>{plain_text}</span>;

      if (href) {
        return <a key={i} href={href} target="_blank" style={{ color: '#0066cc' }}>{element}</a>;
      }
      return element;
    });
  };

  // 2. 根据块类型返回对应的 HTML 标签
  switch (type) {
    case 'paragraph':
      return <p key={id} style={{ marginBottom: '1em', lineHeight: '1.8' }}>{renderText(value.rich_text)}</p>;
    
    case 'heading_1':
      return <h1 key={id} style={{ fontSize: '1.8em', marginTop: '1.5em', marginBottom: '0.5em', fontWeight: 'bold' }}>{renderText(value.rich_text)}</h1>;
    
    case 'heading_2':
      return <h2 key={id} style={{ fontSize: '1.5em', marginTop: '1.2em', marginBottom: '0.4em', fontWeight: 'bold' }}>{renderText(value.rich_text)}</h2>;
    
    case 'heading_3':
      return <h3 key={id} style={{ fontSize: '1.2em', marginTop: '1em', marginBottom: '0.3em', fontWeight: 'bold' }}>{renderText(value.rich_text)}</h3>;

    case 'bulleted_list_item':
    case 'numbered_list_item':
      return <li key={id} style={{ marginBottom: '0.5em', marginLeft: '1.2em' }}>{renderText(value.rich_text)}</li>;

    case 'image':
      const src = value.type === 'external' ? value.external.url : value.file.url;
      return (
        <figure key={id} style={{ margin: '1.5em 0', textAlign: 'center' }}>
          <img src={src} alt="Notion Image" style={{ maxWidth: '100%', borderRadius: '8px' }} />
          {value.caption && <figcaption style={{ fontSize: '0.8em', color: '#888', marginTop: '5px' }}>{renderText(value.caption)}</figcaption>}
        </figure>
      );

    case 'code':
      return (
        <pre key={id} style={{ backgroundColor: '#f5f5f5', padding: '1em', borderRadius: '8px', overflowX: 'auto', marginBottom: '1em' }}>
          <code style={{ fontSize: '0.9em', fontFamily: 'monospace' }}>{renderText(value.rich_text)}</code>
        </pre>
      );

    case 'divider':
      return <hr key={id} style={{ border: 'none', borderTop: '1px solid #eee', margin: '2em 0' }} />;

    default:
      return <div key={id} style={{ color: '#ccc', fontSize: '0.8em' }}>（暂不支持的块类型：{type}）</div>;
  }
}
