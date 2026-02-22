export default async function NotionRenderer({ blockId, token }) {
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
        color: annotations.color && annotations.color !== 'default' ? annotations.color : 'inherit',
      }}>{plain_text}</span>;
      return href ? <a key={i} href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'none' }}>{element}</a> : element;
    });
  };

  return (
    <div style={{ fontSize: '16px' }}>
      {blocks.map((block) => {
        const { type, id } = block;
        const value = block[type];
        switch (type) {
          case 'paragraph':
            // 🚨 新增逻辑：如果是空行，就用 <br /> 撑起高度，保留你的排版间距
            if (!value.rich_text || value.rich_text.length === 0) {
              return <p key={id} style={{ marginBottom: '1.2em' }}><br /></p>;
            }
            return <p key={id} style={{ marginBottom: '1.2em' }}>{renderText(value.rich_text)}</p>;
          case 'heading_1':
            return <h1 key={id} style={{ fontSize: '1.8em', marginTop: '1.5em', marginBottom: '0.8em', fontWeight: 'bold' }}>{renderText(value.rich_text)}</h1>;
          case 'heading_2':
            return <h2 key={id} style={{ fontSize: '1.5em', marginTop: '1.5em', marginBottom: '0.8em', fontWeight: 'bold' }}>{renderText(value.rich_text)}</h2>;
          case 'heading_3':
            return <h3 key={id} style={{ fontSize: '1.2em', marginTop: '1.2em', marginBottom: '0.5em', fontWeight: 'bold' }}>{renderText(value.rich_text)}</h3>;
          case 'bulleted_list_item':
          case 'numbered_list_item':
            return <li key={id} style={{ marginLeft: '1.2em', marginBottom: '0.5em' }}>{renderText(value.rich_text)}</li>;
case 'image':
            const src = value.type === 'external' ? value.external.url : value.file?.url;
            return src ? (
              <div key={id} style={{ margin: '1.5em 0', textAlign: 'center' }}>
                {/* 🚨 修改点：maxWidth 从 100% 改为 50%，图片宽度减半 */}
                <img 
                  src={src} 
                  style={{ 
                    maxWidth: '50%',  // 👈 关键修改在这里
                    maxHeight: '400px', 
                    objectFit: 'contain', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)' // 🎁 额外赠送：加个浅浅的阴影，更有质感
                  }} 
                  alt="Notion Image" 
                />
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
    </div>
  );
}
