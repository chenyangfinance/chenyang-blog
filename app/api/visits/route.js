const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const headers = {
  'Cache-Control': 'no-store'
};

function decodeHeader(value) {
  if (!value) return '';

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function formatLocation(request) {
  const city = decodeHeader(request.headers.get('x-vercel-ip-city'));
  const region = decodeHeader(request.headers.get('x-vercel-ip-country-region'));
  const country = decodeHeader(request.headers.get('x-vercel-ip-country')) || 'Unknown';
  const parts = [city, region, country].filter(Boolean);

  return parts.length ? parts.join(', ') : 'Unknown';
}

function formatCountry(request) {
  const code = request.headers.get('x-vercel-ip-country') || 'Unknown';
  const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });

  if (code === 'Unknown') {
    return { code, name: 'Unknown' };
  }

  return { code, name: countryNames.of(code) || code };
}

async function redisPipeline(commands) {
  if (!redisUrl || !redisToken) {
    return null;
  }

  const res = await fetch(`${redisUrl}/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${redisToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commands),
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error(`Redis request failed: ${res.status}`);
  }

  return res.json();
}

function normalizeCountries(rawCountries) {
  const result = Array.isArray(rawCountries)
    ? rawCountries.reduce((items, value, index, source) => {
        if (index % 2 === 0) {
          const [code, name = code] = String(value).split('|');
          items.push({ code, name, visits: Number(source[index + 1]) || 0 });
        }
        return items;
      }, [])
    : Object.entries(rawCountries || {}).map(([country, visits]) => {
        const [code, name = code] = String(country).split('|');
        return { code, name, visits: Number(visits) || 0 };
      });

  return result
    .filter((item) => item.code)
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 8);
}

function normalizeLocations(rawLocations) {
  const result = Array.isArray(rawLocations)
    ? rawLocations.reduce((items, value, index, source) => {
        if (index % 2 === 0) items.push({ location: value, visits: Number(source[index + 1]) || 0 });
        return items;
      }, [])
    : Object.entries(rawLocations || {}).map(([location, visits]) => ({ location, visits: Number(visits) || 0 }));

  return result
    .filter((item) => item.location)
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 5);
}

async function readStats() {
  const data = await redisPipeline([
    ['GET', 'site:visits:total'],
    ['HGETALL', 'site:visits:countries'],
    ['HGETALL', 'site:visits:locations']
  ]);

  if (!data) {
    return { configured: false, total: null, locations: [] };
  }

  return {
    configured: true,
    total: Number(data[0]?.result) || 0,
    countries: normalizeCountries(data[1]?.result),
    locations: normalizeLocations(data[2]?.result)
  };
}

export async function GET() {
  try {
    return Response.json(await readStats(), { headers });
  } catch {
    return Response.json({ configured: false, total: null, locations: [] }, { status: 500, headers });
  }
}

export async function POST(request) {
  try {
    const location = formatLocation(request);
    const country = formatCountry(request);
    const countryKey = `${country.code}|${country.name}`;
    const data = await redisPipeline([
      ['INCR', 'site:visits:total'],
      ['HINCRBY', 'site:visits:countries', countryKey, 1],
      ['HINCRBY', 'site:visits:locations', location, 1],
      ['HGETALL', 'site:visits:countries'],
      ['HGETALL', 'site:visits:locations']
    ]);

    if (!data) {
      return Response.json({ configured: false, total: null, locations: [] }, { headers });
    }

    return Response.json({
      configured: true,
      total: Number(data[0]?.result) || 0,
      countries: normalizeCountries(data[3]?.result),
      locations: normalizeLocations(data[4]?.result)
    }, { headers });
  } catch {
    return Response.json({ configured: false, total: null, locations: [] }, { status: 500, headers });
  }
}
