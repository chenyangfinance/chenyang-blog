import Link from 'next/link';

// --- 渲染引擎：将 Notion Blocks 转换为 HTML ---
function renderBlock(block) {
  const { type, id } = block;
  const value = block[type];

  // 处理富文本样式（加粗、代码、颜色、链接等）
  const renderText = (textArr) => {
    if (!textArr) return null;
    return textArr.map((text, i) => {
      const { annotations, plain_text, href } = text;
      let element = (
        <span
          key={i}
          style={{
            fontWeight: annotations.bold ? 'bold' : 'normal',
            fontStyle: annotations.italic ? 'italic' : 'normal',
            textDecoration: annotations.strikethrough ? 'line-through' : annotations.underline ? 'underline' : 'none',
            fontFamily: annotations.code ? 'monospace' : 'inherit',
            backgroundColor: annotations.code ? '#f3f3f3' : 'transparent',
            padding: annotations.code ? '2px 4px' : '0',
            borderRadius: '4px',
            color: annotations.color !== 'default' ? annotations.color : 'inherit',
          }}
        >
          {plain_text}
        </span>
      );

      if (href) {
        return <a key={i} href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'underline' }}>{element}</a>;
      }
      return element;
    });
  };

  switch (type) {
    case 'paragraph':
      return <p key={id} style={{ marginBottom: '1.2em', lineHeight: '1.8', color: '#333' }}>{renderText(value.rich_text)}</p>;
    
    case 'heading_1':
      return <h1 key={id} style={{ fontSize: '2em', marginTop: '1.5em', marginBottom: '0.8em', fontWeight: 'bold' }}>{renderText(value.rich_text)}</h1>;
    
    case 'heading_2':
      return <h2 key={id} style={{ fontSize: '1.6em', marginTop: '1.2em', marginBottom: '0.6em', fontWeight: 'bold' }}>{renderText(value.rich_text)}</h2>;
    
    case 'heading_3':
      return <h3 key={id} style={{ fontSize: '1.3em', marginTop: '1em', marginBottom: '0.4em', fontWeight: 'bold' }}>{renderText(value.rich_text)}</h3>;

    case 'bulleted_list_item':
    case 'numbered_list_item':
      return <li key={id} style={{ marginBottom: '0.6em', marginLeft: '1.5em', lineHeight: '1.6' }}>{renderText(value.rich_text)}</li>;

    case 'image':
      const src = value.type === 'external' ? value.external.url : value.file.url;
      return (
        <figure key={id} style={{ margin: '2em 0', textAlign: 'center' }}>
          <img src={src} alt="Notion Content" style={{ maxWidth: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
          {value.caption?.length > 0 && (
            <figcaption style={{ fontSize: '0.9em', color: '#888', marginTop: '10px' }}>{renderText(value.caption)}</figcaption>
          )}
        </figure>
      );

    case 'code':
      return (
        <pre key={id} style={{ backgroundColor: '#f6f8fa', padding: '1.2em', borderRadius: '8px', overflowX: 'auto', marginBottom: '1.5em', border: '1px solid #eaecef' }}>
          <code style={{ fontSize: '0.9em', fontFamily: 'SFMono-Regular, Consolas, monospace' }}>{renderText(value.rich_text)}</code>
        </pre>
      );

    case 'divider':
      return <hr key={id} style={{ border: 'none', borderTop: '1px solid #eee', margin: '2.5em 0' }} />;

    case 'quote':
      return <blockquote key={id} style={{ borderLeft: '4px solid #ddd', paddingLeft: '1em', fontStyle: 'italic', margin: '1.5em 0', color: '#666' }}>{renderText(value.rich_text)}</blockquote>;

    default:
      return null;
  }
}

// --- 页面主体逻辑 ---
export default async function DynamicPage({ params }) {
  const { slug } = await params;
  const DATABASE_ID = process.env.NOTION_PAGE_ID;
  const TOKEN = process.env.NOTION_AUTH_TOKEN;

  // 1. 自动处理匹配字符（About, Research 等）
  const formattedSlug = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();

  // 2. 在 Notion 中搜索对应的 Page
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
          { property: 'type', select: { equals: 'Page' } }, // 必须是 Page 类型
          { property: 'title', title: { contains: formattedSlug } } // 匹配标题
        ]
      }
    }),
    next: { revalidate: 60 }
  });

  const searchData = await searchRes.json();
  const page = searchData.results?.[0];

  // 诊断：如果搜不到页面
  if (!page) {
    return (
      <div style={{ maxWidth: '700px', margin: '100px auto', textAlign: 'center', color: '#666' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>🔍 找不到 "{formattedSlug}" 页面</h2>
        <p>请检查 Notion 数据库：</p>
        <p>1. 是否有一行数据的 <strong>title</strong> 包含 "{formattedSlug}"？</p>
        <p>2. 该行数据的 <strong>type</strong> 标签是否精确设置为 "Page"？</p>
        <Link href="/" style={{ color: '#0066cc', marginTop: '20px', display: 'inline-block' }}>返回首页</Link>
      </div>
    );
  }

  // 3. 获取该页面的正文 Block
  const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${page.id}/children?page_size=100`, {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Notion-Version': '2022-06-28',
    },
    next: { revalidate: 60 }
  });

  const blocksData = await blocksRes.json();
  const blocks = blocksData.results || [];

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', padding: '40px 20px', paddingBottom: '100px' }}>
      {/* 顶部导航 */}
      <nav style={{ marginBottom: '50px' }}>
        <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '15px' }}>← Back to Home</Link>
      </nav>

      {/* 动态标题 */}
      <h1 style={{ fontSize: '2.8em', fontWeight: 'bold', marginBottom: '40px', letterSpacing: '-0.5px' }}>
        {page.properties.title?.title[0]?.plain_text || formattedSlug}
      </h1>

      {/* 渲染正文块 */}
      <div className="notion-content">
        {blocks.map(block => renderBlock(block))}
      </div>
    </div>
  );
}
