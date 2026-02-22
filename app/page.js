import { Client } from '@notionhq/client'

export default async function HomePage() {
  const notion = new Client({ auth: process.env.NOTION_TOKEN })
  
  // 这里的 database_id 会在 Vercel 环境变量里设置
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
    filter: {
      and: [
        { property: 'status', select: { equals: 'Published' } },
        { property: 'type', select: { equals: 'Post' } }
      ]
    },
    sorts: [
      { property: 'date', direction: 'descending' }
    ]
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {response.results.length === 0 && <p>还没有发布的文章，请检查 Notion 状态是否为 Published</p>}
      
      {response.results.map((post) => (
        <div key={post.id} style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'baseline',
          borderBottom: '1px solid #f9f9f9',
          paddingBottom: '10px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '400', margin: 0 }}>
            {post.properties.title.title[0]?.plain_text || '无标题'}
          </h2>
          <span style={{ color: '#aaa', fontSize: '14px' }}>
            {post.properties.date?.date?.start || ''}
          </span>
        </div>
      ))}
    </div>
  )
}
