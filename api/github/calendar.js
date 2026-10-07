/**
 * Vercel Serverless Function — /api/github/calendar
 *
 * Fetches the GitHub contribution calendar for a user via the GitHub GraphQL
 * API and returns the data expected by GithubCalendar.jsx:
 *
 *   { totalContributions: number, weeks: [{ contributionDays: [{ date, contributionCount, color }] }] }
 *
 * GITHUB_TOKEN must be set in Vercel Environment Variables. It is never
 * returned or logged — only used server-side in the Authorization header.
 *
 * Cache: in-memory, 1 hour. Vercel serverless functions share memory between
 * invocations of the same instance, so this reduces GitHub API calls
 * significantly under normal traffic.
 */

// ── In-memory cache ────────────────────────────────────────────────────────
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
let cache = { data: null, expiresAt: 0 };

// ── GraphQL query ──────────────────────────────────────────────────────────
const CONTRIBUTION_QUERY = `
  query($userName: String!) {
    user(login: $userName) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
              color
            }
          }
        }
      }
    }
  }
`;

// ── Handler ────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS — allow the same origin and any Vercel preview URLs
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  // Return cached data if still fresh
  if (cache.data && Date.now() < cache.expiresAt) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json(cache.data);
  }

  // Guard: token must be present in the environment
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('[github/calendar] GITHUB_TOKEN is not set.');
    return res.status(500).json({
      error: 'Server configuration error: GitHub token missing.',
    });
  }

  const username = req.query.username || 'Maur1k';

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'portfolio-app/1.0',
      },
      body: JSON.stringify({
        query: CONTRIBUTION_QUERY,
        variables: { userName: username },
      }),
    });

    if (!response.ok) {
      // Do not forward raw GitHub error — it may contain token context
      console.error(`[github/calendar] GitHub API responded with ${response.status}`);
      return res.status(502).json({
        error: 'Failed to fetch contribution data from GitHub.',
      });
    }

    const payload = await response.json();

    if (payload.errors && payload.errors.length > 0) {
      console.error('[github/calendar] GraphQL errors:', payload.errors.map(e => e.message).join(', '));
      return res.status(502).json({
        error: 'GitHub GraphQL query returned errors.',
      });
    }

    const calendar =
      payload?.data?.user?.contributionsCollection?.contributionCalendar;

    if (!calendar) {
      return res.status(404).json({ error: 'No contribution data found for this user.' });
    }

    // Populate cache
    cache = { data: calendar, expiresAt: Date.now() + CACHE_TTL_MS };

    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(calendar);

  } catch (err) {
    // Catch network errors — do not expose err.message (may contain URL/token fragments)
    console.error('[github/calendar] Unexpected error fetching GitHub data.');
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
