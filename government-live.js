const SOURCES = {
  central: {
    name: 'Central Government',
    ta: 'மத்திய அரசு',
    url: 'https://www.pib.gov.in/indexm.aspx?lang=1&reg=1',
    rss: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1'
  },
  tamilnadu: {
    name: 'Tamil Nadu Government',
    ta: 'தமிழ்நாடு அரசு',
    url: 'https://www.tn.gov.in/pressrelease',
    go: 'https://www.tn.gov.in/go_view/dept'
  },
  tnpsc: {
    name: 'TNPSC Notifications',
    ta: 'TNPSC வேலைவாய்ப்பு அறிவிப்புகள்',
    url: 'https://apply.tnpscexams.in/notification?app_id=UElZMDAwMDAwMQ'
  },
  schemes: {
    name: 'Government Schemes',
    ta: 'அரசு நலத்திட்டங்கள்',
    url: 'https://www.myscheme.gov.in/'
  }
};

const cache = new Map();
const CACHE_MS = 3 * 60 * 1000;

function cleanText(value = '') {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchText(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(18000),
    headers: { 'User-Agent': 'SASIKUMAR-AI-Government-Updates/1.0' }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

function extractTnpsc(html) {
  const rows = [];
  const matches = html.match(/<tr\b[\s\S]*?<\/tr>/gi) || [];

  for (const row of matches) {
    const cells = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)]
      .map(match => match[1]);
    if (cells.length < 7) continue;

    const number = cleanText(cells[0]);
    const title = cleanText(cells[2]);
    if (!/^\d+\/\d{4}$/.test(number) || !title) continue;

    const links = [...row.matchAll(/href=["']([^"']+\.pdf[^"']*)["']/gi)]
      .map(match => match[1])
      .map(link => link.startsWith('http') ? link : new URL(link, SOURCES.tnpsc.url).href);

    rows.push({
      notificationNo: number,
      notificationDate: cleanText(cells[1]),
      title,
      applicationStart: cleanText(cells[3]),
      applicationLastDate: cleanText(cells[4]),
      feeLastDate: cleanText(cells[5]),
      documents: links,
      examDate: cleanText(cells[7] || ''),
      officialUrl: SOURCES.tnpsc.url
    });
  }
  return rows;
}

async function loadCategory(category) {
  const cached = cache.get(category);
  if (cached && Date.now() - cached.time < CACHE_MS) return cached.data;

  const source = SOURCES[category];
  let items = [];
  let status = 'portal_only';
  let error = null;

  try {
    if (category === 'tnpsc') {
      const html = await fetchText(source.url);
      items = extractTnpsc(html);
      status = items.length ? 'live' : 'no_items_found';
    } else if (category === 'central') {
      const rss = await fetchText(source.rss);
      const xmlItems = [...rss.matchAll(/<item\b[\s\S]*?<\/item>/gi)];
      items = xmlItems.map(match => {
        const block = match[0];
        const title = cleanText((block.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
        const link = cleanText((block.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1] || '');
        const pubDate = cleanText((block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || [])[1] || '');
        return { title, link, date: pubDate };
      }).filter(item => item.title && item.link);
      status = items.length ? 'live' : 'feed_empty';
    } else if (category === 'tamilnadu') {
      const html = await fetchText(source.url);
      const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
      items = links.map(match => ({
        title: cleanText(match[2]),
        link: match[1].startsWith('http') ? match[1] : new URL(match[1], source.url).href
      })).filter(item =>
        item.title.length > 12 &&
        !/home|login|contact|skip to/i.test(item.title)
      ).slice(0, 30);
      status = items.length ? 'live' : 'no_items_found';
    } else {
      status = 'official_scheme_portal';
    }
  } catch (err) {
    error = err.message;
    status = 'source_unavailable';
  }

  const data = {
    ok: true,
    category,
    name: source.name,
    tamilName: source.ta,
    status,
    items,
    sources: {
      official: source.url,
      ...(source.go ? { governmentOrders: source.go } : {}),
      ...(source.rss ? { rss: source.rss } : {})
    },
    error,
    checkedAt: new Date().toISOString(),
    note: status === 'live'
      ? 'Information retrieved from the official government source.'
      : 'Live entries could not be verified. Visit the official portal for current information.'
  };

  cache.set(category, { time: Date.now(), data });
  return data;
}


export async function getGovernmentReply(command = '') {
  const text = String(command).trim().toLowerCase();

  let categories;
  let heading;

  if (/^(central govt|central government|மத்திய அரசு)$/i.test(text)) {
    categories = ['central'];
    heading = '🇮🇳 CENTRAL GOVERNMENT — மத்திய அரசு';
  } else if (/^(tn govt|tamil nadu govt|tamilnadu govt|state govt|தமிழ்நாடு அரசு)$/i.test(text)) {
    categories = ['tamilnadu'];
    heading = '🏛️ TAMIL NADU GOVERNMENT — தமிழ்நாடு அரசு';
  } else if (/^(govt schemes|government schemes|schemes|அரசு திட்டங்கள்|நலத்திட்டங்கள்)$/i.test(text)) {
    categories = ['schemes'];
    heading = '🎯 GOVERNMENT SCHEMES — அரசு நலத்திட்டங்கள்';
  } else if (/^(latest notifications|latest notification|govt notifications|government notifications|அரசு அறிவிப்புகள்|அறிவிப்புகள்)$/i.test(text)) {
    categories = ['tnpsc', 'central', 'tamilnadu', 'schemes'];
    heading = '📢 LATEST GOVERNMENT NOTIFICATIONS — சமீபத்திய அரசு அறிவிப்புகள்';
  } else if (/^tnpsc$/i.test(text)) {
    categories = ['tnpsc'];
    heading = '📝 TNPSC NOTIFICATIONS — TNPSC அறிவிப்புகள்';
  } else {
    return null;
  }

  const results = await Promise.all(categories.map(loadCategory));
  const lines = [heading, ''];

  for (const data of results) {
    lines.push('📌 ' + data.name + ' / ' + data.tamilName);

    if (data.status === 'live' && data.items.length) {
      for (const item of data.items.slice(0, 3)) {
        lines.push('• ' + (item.title || 'Government update'));

        if (item.notificationNo) lines.push('Notification: ' + item.notificationNo);
        if (item.notificationDate) lines.push('Date: ' + item.notificationDate);
        if (item.applicationStart) lines.push('Application starts: ' + item.applicationStart);
        if (item.applicationLastDate) lines.push('Last date: ' + item.applicationLastDate);
        if (item.examDate) lines.push('Exam date: ' + item.examDate);

        if (item.link && /^https:\/\//i.test(item.link)) {
          lines.push('Official link: ' + item.link);
        } else if (item.link && /^https:\/\//i.test(item.link)) {
          lines.push('Official link: ' + item.link);
        }

        if (Array.isArray(item.documents)) {
          for (const doc of item.documents.slice(0, 2)) {
            if (/^https:\/\//i.test(doc)) lines.push('PDF: ' + doc);
          }
        }

        if (item.officialUrl && /^https:\/\//i.test(item.officialUrl)) {
          lines.push('Apply / Details: ' + item.officialUrl);
        }
        lines.push('');
      }
    } else {
      lines.push('தற்போது இந்த source-ல் புதிய entries சரிபார்க்கப்படவில்லை.');
      lines.push('Status: ' + data.status);
      if (data.error) lines.push('Source error: ' + data.error);
      lines.push('');
    }

    if (data.sources?.official) lines.push('Official portal: ' + data.sources.official);
    if (data.sources?.governmentOrders) lines.push('Government Orders: ' + data.sources.governmentOrders);
    lines.push('');
  }

  lines.push('⚠️ விண்ணப்பத் தகுதி, கட்டணம், கடைசி தேதி ஆகியவற்றை அதிகாரப்பூர்வ அறிவிப்பில் உறுதிப்படுத்துங்கள்.');
  lines.push('🌐 SASIKUMAR AI: https://sasikumar-ai-9wdq.onrender.com/government-live.html');

  return lines.join('\n').slice(0, 3900);
}

export function registerGovernmentLive(app) {
  app.get('/api/government', async (req, res) => {
    const requested = String(req.query.category || 'all').toLowerCase();
    const categories = requested === 'all'
      ? Object.keys(SOURCES)
      : [requested];

    if (categories.some(category => !SOURCES[category])) {
      return res.status(400).json({
        ok: false,
        error: 'Use category: central, tamilnadu, tnpsc, schemes, or all.'
      });
    }

    res.set('Cache-Control', 'no-store');

    try {
      const results = await Promise.all(categories.map(loadCategory));
      return res.json({
        ok: true,
        service: 'SASIKUMAR AI Government LIVE',
        language: 'Tamil + English',
        checkedAt: new Date().toISOString(),
        results
      });
    } catch (error) {
      console.error('[Government LIVE]', error.message);
      return res.status(503).json({
        ok: false,
        error: 'Government information is temporarily unavailable.'
      });
    }
  });
}
