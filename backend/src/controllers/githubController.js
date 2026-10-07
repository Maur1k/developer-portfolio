// Global fetch is available in Node 18+

// Simple in-memory cache to avoid rate-limiting
let cache = {
  data: null,
  timestamp: null
};

const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

export const getContributionCalendar = async (req, res) => {
  try {
    const { username = 'Maur1k' } = req.query;

    if (cache.data && cache.timestamp && (Date.now() - cache.timestamp < CACHE_DURATION_MS)) {
      return res.json(cache.data);
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.warn("GITHUB_TOKEN not provided in environment variables.");
      return res.status(500).json({ error: "GitHub token missing on server." });
    }

    const query = `
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

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { userName: username },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("GitHub API error:", response.status, text);
      return res.status(response.status).json({ error: "Failed to fetch from GitHub." });
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error("GitHub GraphQL errors:", data.errors);
      return res.status(400).json({ error: "GraphQL query error", details: data.errors });
    }

    const calendar = data.data.user.contributionsCollection.contributionCalendar;

    // Cache the successful response
    cache.data = calendar;
    cache.timestamp = Date.now();

    res.json(calendar);

  } catch (error) {
    console.error("Error fetching GitHub contributions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
