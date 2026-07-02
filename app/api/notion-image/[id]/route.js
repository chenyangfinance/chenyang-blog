export async function GET(_request, { params }) {
  const { id } = await params;
  const token = process.env.NOTION_AUTH_TOKEN;

  if (!token) {
    return new Response('Missing Notion token', { status: 500 });
  }

  const blockRes = await fetch(`https://api.notion.com/v1/blocks/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28'
    },
    cache: 'no-store'
  });

  if (!blockRes.ok) {
    return new Response('Could not load Notion image block', { status: blockRes.status });
  }

  const block = await blockRes.json();
  const image = block.type === 'image' ? block.image : null;
  const imageUrl = image?.type === 'external' ? image.external.url : image?.file?.url;

  if (!imageUrl) {
    return new Response('Image not found', { status: 404 });
  }

  const imageRes = await fetch(imageUrl);

  if (!imageRes.ok) {
    return new Response('Could not load image', { status: imageRes.status });
  }

  return new Response(await imageRes.arrayBuffer(), {
    headers: {
      'Content-Type': imageRes.headers.get('content-type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800'
    }
  });
}
