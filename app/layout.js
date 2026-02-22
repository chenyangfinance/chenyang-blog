import Link from 'next/link';

export const metadata = {
  title: "Chen Yang's Personal Website",
  description: "Assistant Professor at UCD Smurfit Business School",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ 
        margin: 0,
        padding: 0,
        backgroundColor: '#fff',
        // ✅ 全站统一的高级感字体族
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: '#1a1a1a',
        lineHeight: '1.6',
        WebkitFontSmoothing: 'antialiased'
      }}>
        {/* 全局导航栏 */}
        <header style={{ borderBottom: '1px solid #f0f0f0' }}>
          <div style={{
            maxWidth: '850px',
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
              {/* 🚨 这里的链接路径一定要对 */}
              <Link href="/" style={navLinkStyle}>About</Link>
              <Link href="/blog" style={navLinkStyle}>Blog</Link>
              <Link href="/research" style={navLinkStyle}>Research</Link>
              <Link href="/teaching" style={navLinkStyle}>Teaching</Link>
              <Link href="/cnabout" style={{ ...navLinkStyle, color: '#0066cc' }}>中文</Link>
            </nav>
          </div>
        </header>

        {/* 页面主内容 - 控制全站居中 */}
        <main style={{ 
          maxWidth: '850px', 
          margin: '0 auto', 
          padding: '40px 20px',
          minHeight: '70vh' 
        }}>
          {children}
        </main>

        {/* 全局页脚 */}
        <footer style={{ 
          maxWidth: '850px', 
          margin: '80px auto 40px', 
          padding: '20px', 
          textAlign: 'center',
          borderTop: '1px solid #f0f0f0',
          color: '#999',
          fontSize: '13px'
        }}>
          © {new Date().getFullYear()} Chen Yang | Powered by Notion
        </footer>
      </body>
    </html>
  );
}

// 统一的菜单样式
const navLinkStyle = {
  color: '#555',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: '500',
  transition: 'color 0.2s'
};
