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
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: '#222',
        lineHeight: '1.7',
        WebkitFontSmoothing: 'antialiased'
      }}>
        {/* ⬇️ 把丢失的菜单栏补回来 */}
        <header style={{ 
          maxWidth: '850px', 
          margin: '0 auto', 
          padding: '40px 20px 20px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/" style={{ fontSize: '20px', fontWeight: 'bold', textDecoration: 'none', color: '#000' }}>
            Chen Yang
          </Link>
          <nav style={{ display: 'flex', gap: '20px', fontSize: '15px' }}>
            <Link href="/" style={{ color: '#666', textDecoration: 'none' }}>Blog</Link>
            <Link href="/about" style={{ color: '#666', textDecoration: 'none' }}>About</Link>
            <Link href="/research" style={{ color: '#666', textDecoration: 'none' }}>Research</Link>
            <Link href="/teaching" style={{ color: '#666', textDecoration: 'none' }}>Teaching</Link>
            <Link href="/cnabout" style={{ color: '#666', textDecoration: 'none' }}>中文</Link>
          </nav>
        </header>

        {/* 页面具体内容 */}
        <main>{children}</main>

        <footer style={{ 
          maxWidth: '850px', 
          margin: '80px auto 40px', 
          padding: '0 20px', 
          borderTop: '1px solid #eee', 
          paddingTop: '20px',
          color: '#999',
          fontSize: '13px'
        }}>
          © Chen Yang 2026 | Powered by Notion & Next.js
        </footer>
      </body>
    </html>
  );
}
