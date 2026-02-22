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
        // 全站统一字体族
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: '#1a1a1a',
        lineHeight: '1.6',
        WebkitFontSmoothing: 'antialiased'
      }}>
        {/* 全局导航栏 - 增加高度和间距 */}
        <header style={{ 
          borderBottom: '1px solid #f0f0f0', // 增加一条极细的分割线，增加精致感
          marginBottom: '20px'
        }}>
          <div style={{
            maxWidth: '900px', // 稍微放宽一点
            margin: '0 auto',
            padding: '30px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Link href="/" style={{ 
              fontSize: '22px', 
              fontWeight: '700', 
              textDecoration: 'none', 
              color: '#000',
              letterSpacing: '-0.5px'
            }}>
              Chen Yang
            </Link>
            
            <nav style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
              <Link href="/" style={navLinkStyle}>Blog</Link>
              <Link href="/about" style={navLinkStyle}>About</Link>
              <Link href="/research" style={navLinkStyle}>Research</Link>
              <Link href="/teaching" style={navLinkStyle}>Teaching</Link>
              <Link href="/cnabout" style={{ ...navLinkStyle, color: '#0066cc' }}>中文</Link>
            </nav>
          </div>
        </header>

        {/* 页面主内容区 */}
        <main style={{ minHeight: '60vh' }}>
          {children}
        </main>

        {/* 底部信息栏 */}
        <footer style={{ 
          maxWidth: '900px', 
          margin: '100px auto 50px', 
          padding: '0 20px', 
          textAlign: 'center',
          borderTop: '1px solid #f0f0f0',
          paddingTop: '30px',
          color: '#888',
          fontSize: '14px'
        }}>
          © {new Date().getFullYear()} Chen Yang | Powered by Notion
        </footer>
      </body>
    </html>
  );
}

// 统一的导航链接样式
const navLinkStyle = {
  color: '#555',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: '500',
  transition: 'color 0.2s'
};
