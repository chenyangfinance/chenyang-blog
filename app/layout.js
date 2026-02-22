import Link from 'next/link';

export const metadata = {
  title: "Chen Yang's Blog",
  description: "Personal Website of Chen Yang",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ 
        margin: 0,
        padding: 0,
        backgroundColor: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: '#1a1a1a',
        lineHeight: '1.6',
        WebkitFontSmoothing: 'antialiased'
      }}>
        {/* 顶部导航 - 确保与内容区宽度严格一致 */}
        <header style={{ width: '100%' }}>
          <div style={{
            maxWidth: '850px', // 🚨 关键：这里要和 page.js 里的 maxWidth 一致
            margin: '0 auto',
            padding: '40px 20px 20px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Link href="/" style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              textDecoration: 'none', 
              color: '#000',
              letterSpacing: '-0.5px'
            }}>
              Chen Yang
            </Link>
            
        <nav style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
          <Link href="/" style={navLinkStyle}>About</Link> {/* 首页改为 About */}
          <Link href="/blog" style={navLinkStyle}>Blog</Link> {/* 增加 Blog 链接 */}
          <Link href="/research" style={navLinkStyle}>Research</Link>
          <Link href="/teaching" style={navLinkStyle}>Teaching</Link>
          <Link href="/cnabout" style={{ ...navLinkStyle, color: '#0066cc' }}>中文</Link>
        </nav>
          </div>
        </header>

        {/* 主内容区 - 首页不正常通常是因为这里没居中 */}
        <main style={{ 
          maxWidth: '850px', 
          margin: '0 auto', 
          padding: '0 20px',
          minHeight: '70vh' 
        }}>
          {children}
        </main>

        <footer style={{ 
          maxWidth: '850px', 
          margin: '80px auto 40px', 
          padding: '20px 20px', 
          textAlign: 'center',
          borderTop: '1px solid #f5f5f5',
          color: '#999',
          fontSize: '13px'
        }}>
          © {new Date().getFullYear()} Chen Yang | Powered by Notion & Next.js
        </footer>
      </body>
    </html>
  );
}

const navLinkStyle = {
  color: '#666',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: '500'
};
