import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { get } from 'node:http';
import { get as getHttps } from 'node:https';
import { load } from 'cheerio';
import { getDemoJob } from '@/src/lib/demo-jobs';

const MAX_PAGE_BYTES = 2 * 1024 * 1024;
const MAX_TEXT_CHARACTERS = 12_000;
const MAX_REDIRECTS = 4;
const FETCH_TIMEOUT_MS = 10_000;
const ATS_LOOKUP_TIMEOUT_MS = 8_000;

export class JobScrapeError extends Error {
  constructor(message: string, readonly status = 422) {
    super(message);
    this.name = 'JobScrapeError';
  }
}

type IpAddress = { address: string; family: number };
type PageResponse = { statusCode: number; location?: string; contentType: string; body: string };
type ExtractedPosting = { text: string; title: string; company: string; location: string; email: string | null; source: string };

function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) {
    const [a, b, c] = address.split('.').map(Number);
    if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
    if (a === 100 && b >= 64 && b <= 127) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && (b === 0 || b === 168)) return false;
    if (a === 192 && b === 88 && c === 99) return false;
    if (a === 198 && (b === 18 || b === 19 || b === 51)) return false;
    if (a === 203 && b === 0 && c === 113) return false;
    if (a === 255) return false;
    return true;
  }
  if (family === 6) {
    const normalized = address.toLowerCase();
    if (normalized.startsWith('::ffff:')) {
      const mapped = normalized.slice('::ffff:'.length);
      return isIP(mapped) === 4 && isPublicAddress(mapped);
    }
    const firstHextet = Number.parseInt(normalized.split(':')[0] || '0', 16);
    return firstHextet >= 0x2000 && firstHextet <= 0x3fff && !normalized.startsWith('2001:db8:');
  }
  return false;
}

async function resolvePublicAddresses(hostname: string): Promise<IpAddress[]> {
  const normalizedHost = hostname.toLowerCase().replace(/\.$/, '');
  if (!normalizedHost || normalizedHost === 'localhost' || normalizedHost.endsWith('.localhost') || normalizedHost.endsWith('.local') || normalizedHost.endsWith('.internal')) {
    throw new JobScrapeError('Use a public job posting URL. Local and private network addresses are not supported.', 400);
  }

  const addresses = isIP(normalizedHost)
    ? [{ address: normalizedHost, family: isIP(normalizedHost) }]
    : await lookup(normalizedHost, { all: true, verbatim: true });

  if (addresses.length === 0 || addresses.some(({ address }) => !isPublicAddress(address))) {
    throw new JobScrapeError('That URL does not resolve to a public web server.', 400);
  }
  return addresses;
}

async function requestPage(url: URL, signal: AbortSignal, accept = 'text/html,application/xhtml+xml,application/ld+json;q=0.9,*/*;q=0.5'): Promise<PageResponse> {
  const addresses = await resolvePublicAddresses(url.hostname);
  const address = addresses[0];
  const transport = url.protocol === 'https:' ? getHttps : get;

  return new Promise((resolve, reject) => {
    const request = transport(url, {
      method: 'GET',
      signal,
      headers: {
        Accept: accept,
        'Accept-Encoding': 'identity',
        'User-Agent': 'DraftlyJobReader/1.0 (+public job posting import)',
      },
      lookup: (_hostname, options, callback) => {
        // Node calls custom lookup with all=true for some connection paths and
        // expects an array in that case. Returning a scalar can raise
        // ERR_INVALID_IP_ADDRESS before a socket is opened.
        if (options && typeof options === 'object' && 'all' in options && options.all) {
          callback(null, [{ address: address.address, family: address.family }]);
          return;
        }
        callback(null, address.address, address.family);
      },
    }, (response) => {
      const statusCode = response.statusCode ?? 0;
      const contentType = response.headers['content-type']?.toLowerCase() ?? '';
      const contentLength = Number(response.headers['content-length'] ?? 0);

      if (statusCode >= 300 && statusCode < 400 && response.headers.location) {
        response.resume();
        resolve({ statusCode, location: response.headers.location, contentType, body: '' });
        return;
      }
      if (contentLength > MAX_PAGE_BYTES) {
        response.destroy(new Error('The page is larger than the import limit.'));
        return;
      }
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml') && !contentType.includes('application/ld+json') && !contentType.includes('application/json')) {
        response.resume();
        resolve({ statusCode, contentType, body: '' });
        return;
      }

      const chunks: Buffer[] = [];
      let totalBytes = 0;
      response.on('data', (chunk: Buffer | string) => {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        totalBytes += buffer.length;
        if (totalBytes > MAX_PAGE_BYTES) {
          response.destroy(new Error('The page is larger than the import limit.'));
          return;
        }
        chunks.push(buffer);
      });
      response.on('end', () => resolve({ statusCode, contentType, body: Buffer.concat(chunks).toString('utf8') }));
      response.on('error', reject);
    });

    request.on('error', reject);
    request.end();
  });
}

async function downloadPage(startUrl: URL) {
  let current = new URL(startUrl);
  const signal = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    if (!['http:', 'https:'].includes(current.protocol) || current.username || current.password) {
      throw new JobScrapeError('Only public HTTP or HTTPS job posting URLs are supported.', 400);
    }
    let response: PageResponse;
    try {
      response = await requestPage(current, signal);
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
      const name = error instanceof Error ? error.name : '';
      if (name === 'TimeoutError' || name === 'AbortError') {
        throw new JobScrapeError('The job site took too long to respond. Paste the job description instead.', 504);
      }
      if (['ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'CERT_HAS_EXPIRED', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'].includes(code)) {
        throw new JobScrapeError('Draftly could not fetch this job site. It may block automated requests or be temporarily unavailable; paste the job description instead.');
      }
      throw error;
    }
    if (response.statusCode >= 300 && response.statusCode < 400 && response.location) {
      if (redirects === MAX_REDIRECTS) throw new JobScrapeError('The job posting redirected too many times. Paste the job description instead.');
      current = new URL(response.location, current);
      continue;
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new JobScrapeError(`The job site returned HTTP ${response.statusCode}. Paste the job description if the page is private or unavailable.`);
    }
    if (!response.body) throw new JobScrapeError('The page did not return readable HTML. It may require sign-in or browser-based rendering; paste the job description instead.');
    return { html: response.body, finalUrl: current };
  }
  throw new JobScrapeError('Could not follow the job posting URL. Paste the job description instead.');
}

function htmlText(value: string) {
  return load(value).root().text().replace(/\s+/g, ' ').trim();
}

function findJobPosting(value: unknown): Record<string, unknown> | undefined {
  if (Array.isArray(value)) return value.map(findJobPosting).find(Boolean);
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  const type = record['@type'];
  if (type === 'JobPosting' || (Array.isArray(type) && type.includes('JobPosting'))) return record;
  return findJobPosting(record['@graph']) ?? findJobPosting(record.itemListElement);
}

function schemaText(html: string) {
  const $ = load(html);
  for (const script of $('script[type="application/ld+json"]').toArray()) {
    try {
      const parsed = JSON.parse($(script).contents().text()) as unknown;
      const posting = findJobPosting(parsed);
      if (!posting) continue;
      const parts = [posting.title, posting.description, posting.responsibilities, posting.qualifications, posting.skills, posting.experienceRequirements]
        .filter((part): part is string => typeof part === 'string' && part.trim().length > 0);
      if (parts.join('\n').length >= 80) {
        const organization = posting.hiringOrganization as { name?: unknown } | undefined;
        const jobLocation = posting.jobLocation as { address?: Record<string, unknown> } | undefined;
        const address = jobLocation?.address;
        const location = address ? [address.addressLocality, address.addressRegion, address.addressCountry]
          .filter((part): part is string => typeof part === 'string').join(', ') : '';
        return {
          text: parts.map(htmlText).join('\n\n'),
          title: typeof posting.title === 'string' ? posting.title : '',
          company: typeof organization?.name === 'string' ? organization.name : '',
          location,
        };
      }
    } catch { /* Try other JSON-LD blocks, then visible page text. */ }
  }
  return undefined;
}

function extractVisibleText(html: string) {
  const $ = load(html);
  $('script, style, noscript, svg, nav, header, footer, iframe, form, button, [aria-hidden="true"]').remove();
  const selectors = [
    '[itemprop="description"]',
    '[data-testid*="job-description" i]',
    '[class*="job-description" i]',
    '[id*="job-description" i]',
    '[class*="description" i]',
    'article',
    'main',
  ];
  const candidates = selectors.map((selector) => $(selector).map((_, element) => $(element).text()).get().join('\n')).map((text) => text.replace(/\s+/g, ' ').trim());
  const bestCandidate = candidates.sort((a, b) => b.length - a.length)[0] ?? '';
  const bodyText = ($('body').text() || $.root().text()).replace(/\s+/g, ' ').trim();
  return bestCandidate.length >= 300 ? bestCandidate : bodyText;
}

function extractMetadata(html: string, text: string, finalUrl: URL) {
  const $ = load(html);
  const title = $('meta[property="og:title"]').attr('content')?.trim() || $('title').first().text().trim();
  const company = $('meta[property="og:site_name"]').attr('content')?.trim() || finalUrl.hostname.replace(/^www\./, '');
  const location = text.match(/(?:location|勤務地)\s*[:\-–]\s*([^\n|]{2,100})/i)?.[1]?.trim() ?? '';
  return { title, company, location };
}

function normalizedPath(url: URL) {
  return url.pathname.replace(/\/+$/, '').toLowerCase();
}

async function extractAshbyPosting(url: URL): Promise<ExtractedPosting | undefined> {
  if (url.hostname.toLowerCase() !== 'jobs.ashbyhq.com') return undefined;
  const [, boardName, ...postingPath] = url.pathname.split('/').filter(Boolean);
  if (!boardName || !/^[a-z0-9-]+$/i.test(boardName) || postingPath.length === 0) return undefined;

  const apiUrl = new URL(`https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(boardName)}`);
  const startedAt = Date.now();
  try {
    const response = await requestPage(apiUrl, AbortSignal.timeout(ATS_LOOKUP_TIMEOUT_MS), 'application/json');
    if (response.statusCode < 200 || response.statusCode >= 300) {
      console.info('[job-scraper] Ashby public API unavailable', { board: boardName, status: response.statusCode, elapsedMs: Date.now() - startedAt });
      return undefined;
    }
    if (!response.contentType.includes('application/json') || Buffer.byteLength(response.body, 'utf8') > MAX_PAGE_BYTES) return undefined;
    const payload: unknown = JSON.parse(response.body);
    if (!payload || typeof payload !== 'object' || !Array.isArray((payload as { jobs?: unknown }).jobs)) return undefined;

    const requestedPath = normalizedPath(url);
    const requestedId = postingPath.at(-1)?.toLowerCase();
    const jobs = (payload as { jobs: unknown[] }).jobs;
    const job = jobs.find((entry) => {
      if (!entry || typeof entry !== 'object') return false;
      const record = entry as { jobUrl?: unknown; applyUrl?: unknown };
      const candidateUrl = typeof record.jobUrl === 'string' ? record.jobUrl : typeof record.applyUrl === 'string' ? record.applyUrl : '';
      if (!candidateUrl) return false;
      try {
        const candidate = new URL(candidateUrl);
        return candidate.hostname.toLowerCase() === 'jobs.ashbyhq.com' &&
          (normalizedPath(candidate) === requestedPath || candidate.pathname.split('/').filter(Boolean).at(-1)?.toLowerCase() === requestedId);
      } catch {
        return false;
      }
    }) as Record<string, unknown> | undefined;
    console.info('[job-scraper] Ashby public API lookup complete', { board: boardName, found: Boolean(job), elapsedMs: Date.now() - startedAt });
    if (!job) return undefined;

    const plainDescription = typeof job.descriptionPlain === 'string' ? job.descriptionPlain.trim() : '';
    const htmlDescription = typeof job.descriptionHtml === 'string' ? htmlText(job.descriptionHtml) : '';
    const text = [job.title, job.location, job.department, job.team, plainDescription || htmlDescription]
      .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
      .join('\n\n')
      .slice(0, MAX_TEXT_CHARACTERS)
      .trim();
    if (text.length < 80) return undefined;

    const address = job.address as { postalAddress?: { addressLocality?: unknown; addressRegion?: unknown; addressCountry?: unknown } } | undefined;
    const postalAddress = address?.postalAddress;
    const location = [job.location, postalAddress?.addressLocality, postalAddress?.addressRegion, postalAddress?.addressCountry]
      .find((part): part is string => typeof part === 'string' && part.trim().length > 0) ?? '';
    const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? null;
    return {
      text,
      title: typeof job.title === 'string' ? job.title : '',
      company: boardName.replace(/[-_]+/g, ' '),
      location,
      email,
      source: typeof job.jobUrl === 'string' ? job.jobUrl : url.toString(),
    };
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : undefined;
    console.info('[job-scraper] Ashby public API lookup failed', { board: boardName, name: error instanceof Error ? error.name : 'UnknownError', code, elapsedMs: Date.now() - startedAt });
    return undefined;
  }
}

export async function extractJobPosting(urlString: string): Promise<ExtractedPosting> {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new JobScrapeError('Enter a valid job posting URL.', 400);
  }

  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new JobScrapeError('Only public HTTP or HTTPS job posting URLs are supported.', 400);
  }
  if (['localhost', '127.0.0.1'].includes(url.hostname)) {
    const match = url.pathname.match(/^\/demo-jobs\/([a-z0-9-]+)\/?$/i);
    const demo = match ? getDemoJob(match[1]) : undefined;
    if (demo) return { text: demo.text, title: demo.title, company: demo.company, location: demo.location, email: demo.email || null, source: demo.source };
    throw new JobScrapeError('Local URLs are accepted only for the included sample job pages.', 400);
  }

  const ashbyPosting = await extractAshbyPosting(url);
  if (ashbyPosting) return ashbyPosting;

  let downloaded: { html: string; finalUrl: URL };
  try {
    downloaded = await downloadPage(url);
  } catch (error) {
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : undefined;
    console.warn('[job-scraper] fetch failed', { host: url.hostname, name: error instanceof Error ? error.name : 'UnknownError', code });
    throw error;
  }
  const { html, finalUrl } = downloaded;
  const posting = schemaText(html);
  let text = posting?.text ?? extractVisibleText(html);
  text = text.slice(0, MAX_TEXT_CHARACTERS).trim();
  if (text.length < 80) {
    throw new JobScrapeError('Could not find a readable job description on that page. It may require sign-in or browser-based rendering; paste the job description instead.');
  }

  const metadata = extractMetadata(html, text, finalUrl);
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? null;
  return {
    text,
    title: posting?.title || metadata.title,
    company: posting?.company || metadata.company,
    location: posting?.location || metadata.location,
    email,
    source: finalUrl.toString(),
  };
}
