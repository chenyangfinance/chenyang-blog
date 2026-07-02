import Link from 'next/link';
import './globals.css';

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
        fontFamily: '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
        color: '#1d1d1f',
        lineHeight: '1.6',
        WebkitFontSmoothing: 'antialiased'
      }}>
        <header style={{ marginBottom: '72px' }}>
          <div style={{
            maxWidth: '1040px',
            margin: '0 auto',
            padding: '48px 24px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '17px', fontWeight: '650', textDecoration: 'none', color: '#4b5563', letterSpacing: '0.01em' }}>
              <span aria-hidden="true" style={{ width: '24px', height: '24px', display: 'inline-block', background: 'linear-gradient(135deg, #111 0%, #555 100%)' }} />
              <span>Chen Yang</span>
            </Link>
<nav style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
  <Link href="/" style={navLinkStyle}>About</Link>
  
  {/* 暂时隐藏 Blog 菜单 
  <Link href="/blog" style={navLinkStyle}>Blog</Link>
  */}
  
  <Link href="/research" style={navLinkStyle}>Research</Link>
  <Link href="/teaching" style={navLinkStyle}>Teaching</Link>
  <Link href="/cnabout" style={{ ...navLinkStyle, color: '#0066cc' }}>中文</Link>
</nav>
          </div>
        </header>

        <main style={{ maxWidth: '1040px', margin: '0 auto', padding: '0 24px', minHeight: '60vh' }}>
          {children}
        </main>

        <footer style={{ maxWidth: '1040px', margin: '88px auto 48px', padding: '20px 24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
          © {new Date().getFullYear()} Chen Yang | Powered by Notion
        </footer>
      </body>
    </html>
  );
}

const navLinkStyle = { color: '#111', textDecoration: 'none', fontSize: '17px', fontWeight: '450', letterSpacing: '0', transition: 'color 0.2s' };
