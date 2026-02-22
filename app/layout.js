export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '60px 20px', 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#111'
      }}>
        <nav style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '60px' 
        }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Chen Yang</div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#666' }}>
            <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Blog</a>
            <a href="/about" style={{ textDecoration: 'none', color: 'inherit' }}>About</a>
            <a href="/research" style={{ textDecoration: 'none', color: 'inherit' }}>Research</a>
            <a href="/teaching" style={{ textDecoration: 'none', color: 'inherit' }}>Teaching</a>
            <a href="/photos" style={{ textDecoration: 'none', color: 'inherit' }}>Photos</a>
            <span style={{ cursor: 'pointer' }}>🔍</span>
            <a href="/zh" style={{ textDecoration: 'none', color: 'inherit' }}>中文</a>
          </div>
        </nav>
        <main>{children}</main>
        <footer style={{ marginTop: '100px', paddingTop: '20px', borderTop: '1px solid #eee', fontSize: '12px', color: '#999' }}>
          © Chen Yang 1996 - 2026 | Powered by Vercel
        </footer>
      </body>
    </html>
  )
}
