export default async function HomePage() {
  const DATABASE_ID = process.env.NOTION_PAGE_ID;
  const TOKEN = process.env.NOTION_AUTH_TOKEN;

  const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    // 🚨 重点 1：去掉了所有的 filter，不管什么状态全抓出来！
    body: JSON.stringify({}),
    // 🚨 重点 2：强制取消 Vercel 缓存，保证你每次刷新看到的都是最新数据！
    cache: 'no-store'
  });

  // 如果钥匙有问题，会直接把 Notion 的报错原封不动打印在网页上
  if (!res.ok) {
    const errInfo = await res.text();
    return <div style={{ color: 'red', wordBreak: 'break-all' }}>Notion 拒绝访问，原因：{errInfo}</div>;
  }

  const data = await res.json();
  const posts = data.results || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 这是一个绿色的调试框，告诉你到底抓到了几条数据 */}
      <div style={{ padding: '15px', background: '#e6ffe6', borderRadius: '8px', color: '#006600' }}>
        🎉 恭喜！成功连上 Notion 数据库！一共抓到了 {posts.length} 条数据。
      </div>

      {posts.map((post) => {
        // 暴力破解标题：不管你的列名叫 "title" 还是 "Name"，我都给你挖出来
        const titleKeys = Object.keys(post.properties).filter(k => post.properties[k].type === 'title');
        const titleProp = titleKeys.length > 0 ? post.properties[titleKeys[0]] : null;
        const titleText = titleProp?.title?.[0]?.plain_text || '未命名文章';

        return (
          <div key={post.id} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'baseline',
            borderBottom: '1px solid #f9f9f9',
            paddingBottom: '10px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '400', margin: 0 }}>
              {titleText}
            </h2>
          </div>
        )
      })}
    </div>
  );
}
