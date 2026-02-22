import Link from 'next/link';

// 这个小工具专门负责把 Notion 的段落、标题、代码块翻译成网页元素
function renderBlock(block) {
  const { type, id } = block;
  const value = block[type];

  // 提取加粗、斜体等文本样式
  const textContent = value?.rich_text?.map((text, i) => {
    let content = text.plain_text;
    if (text.annotations.bold) content = <strong key={i}>{content}</strong>;
    if (text.annotations.italic) content = <em key={i}>{content}</em>;
    if (text.annotations.code) content = <code key={i} style={{background: '#eee', padding: '2px 4px', borderRadius: '4px'}}>{content}</code>;
    if (text.href) content = <a key={i} href={text.href} target="_blank" style={{color: '#0066cc', textDecoration: 'underline'}}>{content}</a>;
    return <span key={i}>{content}</span>;
  }) || [];

  switch (type) {
    case 'paragraph':
      return <p key={id} style={{ lineHeight: '1.8', marginBottom: '16px', color: '#333' }}>{textContent.length ? textContent : <br />}</p>;
    case 'heading_1':
      return <h1 key={id} style={{ marginTop: '2em', marginBottom: '1em', fontSize: '28px' }}>{textContent}</h1>;
    case 'heading_2':
      return <h2 key={id} style={{ marginTop: '1.5em', marginBottom: '0.75em', fontSize: '24px' }}>{textContent}</h2>;
    case 'heading_3':
      return <h3 key={id} style={{ marginTop: '1.2em', marginBottom: '0.5em', fontSize: '20px' }}>{textContent}</h3>;
    case 'bulleted_list_item':
    case 'numbered_list_item':
      return <li key={id} style={{ lineHeight: '1.8', marginLeft: '20px', color: '#333' }}>{textContent}</li>;
    case 'image':
      const src = value.type === 'external' ? value.external.url : value.file.url;
      return <img key={id} src={src} alt="Notion Image" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '16px', marginBottom: '16px' }} />;
    case 'code':
      return (
        <pre key={id} style={{ background: '#f4f4f4', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontSize: '14px', marginBottom: '16px' }}>
          <code>{textContent}</code>
        </pre>
      );
    default:
      return null; // 其他复杂的表格、数据库块暂时不显示
  }
}

export default async function PostPage({ params }) {
  // 获取刚刚从主页传过来的文章 ID
  const { id } = await params;
  const TOKEN = process.env.NOTION_AUTH_TOKEN;

  // 1. 获取文章的标题信息
  const pageRes = await fetch(`https://api.notion.com/v1/pages/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Notion-Version': '2022-06-28',
    },
    next: { revalidate: 60 }
  });
  
  // 2. 获取文章的具体正文内容 (Blocks)
  const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${id}/children?page_size=100`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Notion-Version': '2022-06-28',
    },
    next: { revalidate: 60 }
  });

  if (!pageRes.ok || !blocksRes.ok) {
    return <div style={{marginTop: '50px', textAlign: 'center'}}>🚨 文章加载失败，请检查是否删除了该文章。</div>;
  }

  const pageData = await pageRes.json();
  const blocksData = await blocksRes.json();

  // 挖出标题
  const titleKeys = Object.keys(pageData.properties).filter(k => pageData.properties[k].type === 'title');
  const titleProp = titleKeys.length > 0 ? pageData.properties[titleKeys[0]] : null;
  const titleText = titleProp?.title?.[0]?.plain_text || '无标题';

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', paddingBottom: '80px' }}>
      {/* 返回按钮 */}
      <div style={{ marginBottom: '40px' }}>
        <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '15px' }}>
          &larr; Back to Home
        </Link>
      </div>
      
      {/* 文章大标题 */}
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '40px', lineHeight: '1.4' }}>
        {titleText}
      </h1>

      {/* 逐个渲染文章的段落、图片 */}
      <div style={{ fontSize: '16px' }}>
        {blocksData.results.map(block => renderBlock(block))}
      </div>
    </div>
  );
}
