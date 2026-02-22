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
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        color: '#222',
        lineHeight: '1.7',
        WebkitFontSmoothing: 'antialiased'
      }}>
        <header style={{ borderBottom: '1px solid #f0f0f0', marginBottom: '40px' }}>
          <div style={{
            maxWidth: '850px',
            margin: '0 auto',
            padding: '30px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Link href="/" style={{ fontSize: '22px', fontWeight: '700', textDecoration: 'none', color: '#000', letterSpacing: '-0.5px' }}>
              Chen Yang
            </Link>
            <nav style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
              <Link href="/" style={navLinkStyle}>About</Link>
              <Link href="/blog" style={navLinkStyle}>Blog</Link>
              <Link href="/research" style={navLinkStyle}>Research</Link>
              <Link href="/teaching" style={navLinkStyle}>Teaching</Link>
              <Link href="/cnabout" style={{ ...navLinkStyle, color: '#0066cc' }}>中文</Link>
            </nav>
          </div>
        </header>

        <main style={{ maxWidth: '850px', margin: '0 auto', padding: '0 20px', minHeight: '60vh' }}>
          {children}
        </main>

        <footer style={{ maxWidth: '850px', margin: '80px auto 40px', padding: '20px', textAlign: 'center', borderTop: '1px solid #f0f0f0', color: '#999', fontSize: '13px' }}>
          © {new Date().getFullYear()} Chen Yang | Powered by Notion
        </footer>
      </body>
    </html>
  );
}

const navLinkStyle = { color: '#555', textDecoration: 'none', fontSize: '15px', fontWeight: '500', transition: 'color 0.2s' };
