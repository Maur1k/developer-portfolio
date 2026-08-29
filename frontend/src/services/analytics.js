import { supabase, isSupabaseConfigured } from '../supabase/client';

const VISITOR_KEY = 'mp_vid';
const SESSION_KEY = 'mp_sid';
const LOCAL_EVENTS_KEY = 'mp_local_events';
const MAX_LOCAL_EVENTS = 50;

/**
 * Generate a random UUID-like string
 */
function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create an anonymous Visitor ID (persisted in localStorage)
 */
export function getOrCreateVisitorId() {
  try {
    let vid = localStorage.getItem(VISITOR_KEY);
    if (!vid) {
      vid = generateId();
      localStorage.setItem(VISITOR_KEY, vid);
    }
    return vid;
  } catch {
    return generateId();
  }
}

/**
 * Get or create an anonymous Session ID (persisted in sessionStorage)
 */
export function getOrCreateSessionId() {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = generateId();
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return generateId();
  }
}

/**
 * Normalize and categorize referrer domain or URL parameter source
 */
export function getReferrerSource() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source') || urlParams.get('ref') || urlParams.get('source');
    if (utmSource) {
      const lower = utmSource.toLowerCase();
      if (lower.includes('linkedin')) return 'LinkedIn';
      if (lower.includes('github')) return 'GitHub';
      if (lower.includes('google')) return 'Google';
      if (lower.includes('twitter') || lower.includes('x')) return 'Twitter / X';
      if (lower.includes('facebook') || lower.includes('fb')) return 'Facebook';
      return utmSource.charAt(0).toUpperCase() + utmSource.slice(1);
    }

    const referrer = document.referrer;
    if (!referrer) return 'Direct';

    const refHost = new URL(referrer).hostname.toLowerCase();
    const currentHost = window.location.hostname.toLowerCase();

    if (refHost === currentHost || refHost.includes('localhost') || refHost === '127.0.0.1') {
      return 'Direct';
    }

    if (refHost.includes('linkedin.com') || refHost.includes('lnkd.in')) return 'LinkedIn';
    if (refHost.includes('google.')) return 'Google';
    if (refHost.includes('github.com') || refHost.includes('github.io')) return 'GitHub';
    if (refHost.includes('twitter.com') || refHost.includes('x.com') || refHost.includes('t.co')) return 'Twitter / X';
    if (refHost.includes('facebook.com') || refHost.includes('fb.com')) return 'Facebook';
    if (refHost.includes('instagram.com')) return 'Instagram';
    if (refHost.includes('reddit.com')) return 'Reddit';
    if (refHost.includes('youtube.com') || refHost.includes('youtu.be')) return 'YouTube';
    if (refHost.includes('bing.com')) return 'Bing';
    if (refHost.includes('duckduckgo.com')) return 'DuckDuckGo';

    // Format clean domain name
    return refHost.replace(/^www\./, '');
  } catch {
    return 'Direct';
  }
}

/**
 * Detect client device, browser, and OS without collecting PII
 */
export function getDeviceInfo() {
  if (typeof navigator === 'undefined') {
    return { deviceType: 'Desktop', browser: 'Unknown', os: 'Unknown' };
  }

  const ua = navigator.userAgent || '';
  let deviceType = 'Desktop';
  if (/iPad|Tablet|PlayBook/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua))) {
    deviceType = 'Tablet';
  } else if (/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    deviceType = 'Mobile';
  }

  let browser = 'Other';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua) && !/Chromium|Edg|OPR/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome|Chromium|Edg|OPR/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/OPR|Opera/i.test(ua)) browser = 'Opera';

  let os = 'Other';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Macintosh|Mac OS/i.test(ua)) os = 'macOS';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return { deviceType, browser, os };
}

// Memory debounce tracker for rapid duplicate events
const recentEventTimestamps = new Map();

/**
 * Track an anonymous event
 * @param {string} eventType - 'page_view' | 'resume_view' | 'resume_download' | 'project_view' | 'project_click' | 'contact_click' | 'github_click' | 'linkedin_click' | 'copilot_open'
 * @param {string|null} eventTarget - e.g. project title, button name, section name
 * @param {object} metadata - optional additional parameters
 */
export async function trackEvent(eventType, eventTarget = null, metadata = {}) {
  try {
    const key = `${eventType}:${eventTarget || ''}`;
    const now = Date.now();
    const lastTime = recentEventTimestamps.get(key) || 0;

    // Debounce duplicate page_view events within 5 seconds
    if (now - lastTime < 5000 && eventType === 'page_view') {
      return;
    }
    recentEventTimestamps.set(key, now);

    const visitorId = getOrCreateVisitorId();
    const sessionId = getOrCreateSessionId();
    const referrer = getReferrerSource();
    const referrerRaw = typeof document !== 'undefined' ? document.referrer || '' : '';
    const { deviceType, browser, os } = getDeviceInfo();
    const pagePath = typeof window !== 'undefined' ? window.location.pathname + window.location.hash : '/';

    const eventPayload = {
      visitor_id: visitorId,
      session_id: sessionId,
      event_type: eventType,
      event_target: eventTarget ? String(eventTarget) : null,
      referrer,
      referrer_raw: referrerRaw,
      device_type: deviceType,
      browser,
      os,
      page_path: pagePath,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    };

    // Save to local backup buffer (for instant UI previews & offline reliability)
    try {
      const local = JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY) || '[]');
      local.unshift(eventPayload);
      if (local.length > MAX_LOCAL_EVENTS) local.pop();
      localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(local));
    } catch {
      // Ignore local storage quota errors
    }

    // Save to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      await supabase.from('analytics_events').insert([eventPayload]);
    }
  } catch (err) {
    // Fail silently in production so user interaction is never interrupted
    console.debug('Analytics telemetry note:', err);
  }
}

/**
 * Format relative time (e.g. "2m ago", "1h ago", "3d ago")
 */
export function formatTimeAgo(dateString) {
  if (!dateString) return 'just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.max(1, Math.floor((now - date) / 1000));

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format event title for display
 */
export function formatEventLabel(event) {
  const type = event.event_type;
  const target = event.event_target;

  switch (type) {
    case 'page_view':
      return target ? `Viewed ${target}` : 'Portfolio viewed';
    case 'resume_view':
      return 'Resume opened';
    case 'resume_download':
      return 'Resume downloaded';
    case 'project_view':
      return target ? `${target} viewed` : 'Project viewed';
    case 'project_click':
      return target ? `${target} link clicked` : 'Project link clicked';
    case 'github_click':
      return target ? `GitHub (${target}) clicked` : 'GitHub clicked';
    case 'linkedin_click':
      return 'LinkedIn clicked';
    case 'contact_click':
      return target ? `${target} clicked` : 'Contact clicked';
    case 'copilot_open':
      return 'AI Copilot opened';
    default:
      return target ? `${target} (${type})` : type;
  }
}

/**
 * Generate rich fallback / baseline analytics data for initial state or offline mode
 */
function getFallbackAnalytics() {
  const baseVisitors = 1284;
  const baseViews = 2431;
  const baseResume = 183;
  const baseProjectClicks = 97;

  // 7-day traffic curve matching the mockup pattern
  const traffic = [
    { day: 'Mon', count: 110 },
    { day: 'Tue', count: 105 },
    { day: 'Wed', count: 140 },
    { day: 'Thu', count: 185 },
    { day: 'Fri', count: 195 },
    { day: 'Sat', count: 130 },
    { day: 'Sun', count: 160 },
  ];

  const topSources = [
    { source: 'LinkedIn', percentage: 48, count: 616 },
    { source: 'Google', percentage: 23, count: 295 },
    { source: 'GitHub', percentage: 17, count: 218 },
    { source: 'Direct', percentage: 12, count: 155 },
  ];

  const mostViewedProjects = [
    { title: 'WIBE V2', views: 421 },
    { title: 'When In Baguio Eats', views: 367 },
    { title: 'Portfolio', views: 298 },
    { title: 'Barangay Health System', views: 184 },
  ];

  const recentEvents = [
    {
      id: 'e1',
      event_type: 'resume_view',
      event_target: 'Resume Modal Opened',
      referrer: 'LinkedIn',
      created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    },
    {
      id: 'e2',
      event_type: 'project_view',
      event_target: 'WIBE V2',
      referrer: 'Direct',
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: 'e3',
      event_type: 'github_click',
      event_target: 'Sidebar GitHub',
      referrer: 'Google',
      created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
    {
      id: 'e4',
      event_type: 'contact_click',
      event_target: 'Contact Button',
      referrer: 'LinkedIn',
      created_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    },
    {
      id: 'e5',
      event_type: 'project_click',
      event_target: 'When In Baguio Eats',
      referrer: 'GitHub',
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
  ];

  return {
    metrics: {
      visitors: baseVisitors,
      visitorsGrowth: '+18.4%',
      views: baseViews,
      viewsGrowth: '+24.1%',
      resumeViews: baseResume,
      resumeGrowth: '+31%',
      projectClicks: baseProjectClicks,
      projectClicksGrowth: '+12%',
    },
    traffic,
    topSources,
    mostViewedProjects,
    recentEvents,
  };
}

/**
 * Fetch and aggregate analytics dashboard metrics
 * @param {string} range - '7d' | '30d' | 'all'
 * @param {boolean} forceDemo - if true, returns the mockup showcase data
 */
export async function fetchAnalyticsData(range = '30d', forceDemo = false) {
  const fallback = getFallbackAnalytics();

  if (forceDemo) {
    return { ...fallback, isLive: false, totalRealEvents: 0 };
  }

  // Read any locally stored client events
  let localEvents = [];
  try {
    localEvents = JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY) || '[]');
  } catch {
    localEvents = [];
  }

  // If Supabase not connected, calculate purely from local client events
  if (!isSupabaseConfigured || !supabase) {
    if (localEvents.length > 0) {
      const visitorsSet = new Set(localEvents.map((e) => e.visitor_id));
      const viewsCount = localEvents.filter((e) => e.event_type === 'page_view').length;
      const resumeCount = localEvents.filter((e) => e.event_type.startsWith('resume')).length;
      const projectClickCount = localEvents.filter((e) => e.event_type.startsWith('project')).length;

      // Sources aggregation
      const sourceCounts = {};
      localEvents.forEach((e) => {
        const src = e.referrer || 'Direct';
        sourceCounts[src] = (sourceCounts[src] || 0) + 1;
      });

      const totalEvents = localEvents.length || 1;
      const topSources = Object.entries(sourceCounts)
        .map(([source, count]) => ({
          source,
          count,
          percentage: Math.round((count / totalEvents) * 100),
        }))
        .sort((a, b) => b.count - a.count);

      // Most viewed projects
      const projectCounts = {};
      localEvents
        .filter((e) => e.event_type === 'project_view' || e.event_type === 'project_click')
        .forEach((e) => {
          const title = e.event_target || 'General Project';
          projectCounts[title] = (projectCounts[title] || 0) + 1;
        });

      const mostViewedProjects = Object.entries(projectCounts)
        .map(([title, views]) => ({ title, views }))
        .sort((a, b) => b.views - a.views);

      return {
        isLive: true,
        isSupabase: false,
        totalRealEvents: localEvents.length,
        metrics: {
          visitors: visitorsSet.size,
          visitorsGrowth: '+100%',
          views: viewsCount,
          viewsGrowth: viewsCount > 0 ? '+100%' : '0%',
          resumeViews: resumeCount,
          resumeGrowth: resumeCount > 0 ? '+100%' : '0%',
          projectClicks: projectClickCount,
          projectClicksGrowth: projectClickCount > 0 ? '+100%' : '0%',
        },
        traffic: calculateTrafficFromEvents(localEvents),
        topSources: topSources.length ? topSources : [{ source: 'Direct', percentage: 100, count: 1 }],
        mostViewedProjects,
        recentEvents: localEvents.slice(0, 20),
      };
    }

    return {
      isLive: false,
      isSupabase: false,
      totalRealEvents: 0,
      ...fallback,
    };
  }

  try {
    // Fetch live rows from Supabase
    let query = supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    const now = new Date();
    if (range === '7d') {
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', cutoff);
    } else if (range === '30d') {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', cutoff);
    }

    const { data: dbEvents, error } = await query;
    if (error) {
      console.warn('Supabase analytics query note:', error.message);
      // If table doesn't exist yet or query fails, fallback gracefully
      return {
        isLive: false,
        isSupabase: false,
        totalRealEvents: 0,
        errorMessage: error.message,
        ...fallback,
      };
    }

    const allEvents = Array.isArray(dbEvents) ? dbEvents : [];

    // If 0 events in Supabase yet, check local events or return clean zero state
    if (allEvents.length === 0) {
      if (localEvents.length > 0) {
        return fetchAnalyticsData(range, false);
      }

      return {
        isLive: true,
        isSupabase: true,
        totalRealEvents: 0,
        metrics: {
          visitors: 0,
          visitorsGrowth: '0%',
          views: 0,
          viewsGrowth: '0%',
          resumeViews: 0,
          resumeGrowth: '0%',
          projectClicks: 0,
          projectClicksGrowth: '0%',
        },
        traffic: calculateTrafficFromEvents([]),
        topSources: [{ source: 'Direct', percentage: 100, count: 0 }],
        mostViewedProjects: [],
        recentEvents: [],
      };
    }

    // Calculate genuine distinct visitors
    const visitorsSet = new Set(allEvents.map((e) => e.visitor_id));
    const viewsCount = allEvents.filter((e) => e.event_type === 'page_view').length;
    const resumeCount = allEvents.filter((e) => e.event_type.startsWith('resume')).length;
    const projectClickCount = allEvents.filter((e) => e.event_type.startsWith('project')).length;

    // Calculate real sources
    const sourceCounts = {};
    allEvents.forEach((e) => {
      const src = e.referrer || 'Direct';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });

    const totalEvents = allEvents.length || 1;
    const topSources = Object.entries(sourceCounts)
      .map(([source, count]) => ({
        source,
        count,
        percentage: Math.round((count / totalEvents) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    // Calculate real most viewed projects
    const projectCounts = {};
    allEvents
      .filter((e) => e.event_type === 'project_view' || e.event_type === 'project_click')
      .forEach((e) => {
        const title = e.event_target || 'Project';
        projectCounts[title] = (projectCounts[title] || 0) + 1;
      });

    const mostViewedProjects = Object.entries(projectCounts)
      .map(([title, views]) => ({ title, views }))
      .sort((a, b) => b.views - a.views);

    return {
      isLive: true,
      isSupabase: true,
      totalRealEvents: allEvents.length,
      metrics: {
        visitors: visitorsSet.size,
        visitorsGrowth: '+100%',
        views: viewsCount,
        viewsGrowth: viewsCount > 0 ? '+100%' : '0%',
        resumeViews: resumeCount,
        resumeGrowth: resumeCount > 0 ? '+100%' : '0%',
        projectClicks: projectClickCount,
        projectClicksGrowth: projectClickCount > 0 ? '+100%' : '0%',
      },
      traffic: calculateTrafficFromEvents(allEvents),
      topSources,
      mostViewedProjects,
      recentEvents: allEvents.slice(0, 20),
    };
  } catch (err) {
    console.debug('Analytics fetch fallback note:', err);
    return {
      isLive: false,
      isSupabase: false,
      totalRealEvents: 0,
      ...fallback,
    };
  }
}

function calculateTrafficFromEvents(events = []) {
  const now = new Date();
  const daysMap = {};

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString('en-US', { weekday: 'short' });
    daysMap[key] = 0;
  }

  events.forEach((e) => {
    const d = new Date(e.created_at);
    const key = d.toLocaleDateString('en-US', { weekday: 'short' });
    if (daysMap[key] !== undefined) {
      daysMap[key]++;
    }
  });

  return Object.entries(daysMap).map(([day, count]) => ({
    day,
    count,
  }));
}
