import type { NewsItem, NewsSentiment, NewsCategory } from '@game/shared';
import { createChildLogger } from '../config/logger.js';

const log = createChildLogger('market:news');

// ────────────────────────────────────────────────────────────
// Headline Pool — Indian stock-market & geopolitical colour
// ────────────────────────────────────────────────────────────

interface HeadlineTemplate {
  headline: string;
  detail?: string;
  source: string;
  sentiment: NewsSentiment;
  category: NewsCategory;
}

const HEADLINE_POOL: HeadlineTemplate[] = [
  // ─── Bullish – Equity ───
  { headline: 'Nifty50 breaches 24,000 mark; broad-based buying lifts sentiment', source: 'ET Markets', sentiment: 'bullish', category: 'equity', detail: 'All sectoral indices close in the green with IT and banks leading the charge.' },
  { headline: 'Sensex surges 600 pts on strong FII inflows', source: 'Moneycontrol', sentiment: 'bullish', category: 'equity' },
  { headline: 'FIIs turn net buyers — ₹4,200 Cr poured into Indian equities today', source: 'NDTV Profit', sentiment: 'bullish', category: 'equity' },
  { headline: 'Midcap index hits fresh all-time high; breadth overwhelmingly positive', source: 'Livemint', sentiment: 'bullish', category: 'equity' },
  { headline: 'Reliance Industries crosses ₹21 Lakh Cr market cap — new milestone', source: 'Business Standard', sentiment: 'bullish', category: 'equity' },
  { headline: 'IT stocks rally as Accenture guidance beats Street estimates', source: 'ET Markets', sentiment: 'bullish', category: 'sector' },
  { headline: 'Auto sector outperforms as June sales data smashes forecasts', source: 'Moneycontrol', sentiment: 'bullish', category: 'sector' },
  { headline: 'Metal stocks surge on China stimulus hopes; Tata Steel up 4%', source: 'CNBC-TV18', sentiment: 'bullish', category: 'sector' },
  { headline: 'Banking index rallies; HDFC Bank, ICICI Bank clock fresh 52-week highs', source: 'Livemint', sentiment: 'bullish', category: 'equity' },
  { headline: 'Adani Green bags ₹12,000 Cr solar order — stock jumps 6%', source: 'ET Now', sentiment: 'bullish', category: 'equity' },
  { headline: 'PSU banks rally as Govt announces recapitalization plan', source: 'Business Standard', sentiment: 'bullish', category: 'sector' },
  { headline: 'India\'s services PMI at 61.2 — strongest expansion in 14 months', source: 'Reuters India', sentiment: 'bullish', category: 'macro' },
  { headline: 'Retail inflation falls to 4.25% — well within RBI\'s comfort zone', source: 'ET Markets', sentiment: 'bullish', category: 'macro' },
  { headline: 'Q2 GDP growth at 7.8% — India fastest-growing large economy', source: 'NDTV Profit', sentiment: 'bullish', category: 'macro' },
  { headline: 'GST collections hit record ₹2.10 Lakh Cr in March', source: 'Moneycontrol', sentiment: 'bullish', category: 'macro' },

  // ─── Bullish – Derivative ───
  { headline: 'Nifty option chain shows massive PE writing at 23,800 — strong support', source: 'Sensibull', sentiment: 'bullish', category: 'derivative', detail: 'Put-Call ratio at 1.35 indicating bullish positioning.' },
  { headline: 'Open Interest build-up in Nifty 24,500 CE below 10 Lakh — room to rally', source: 'Opstra', sentiment: 'bullish', category: 'derivative' },
  { headline: 'Long buildup seen in Bank Nifty futures; rollover at 82%', source: 'Moneycontrol', sentiment: 'bullish', category: 'derivative' },
  { headline: 'India VIX drops below 12 — fear quotient at multi-year lows', source: 'NSE', sentiment: 'bullish', category: 'derivative' },

  // ─── Bullish – Geopolitical / RBI ───
  { headline: 'RBI keeps repo rate unchanged at 6.5%; stance shifted to neutral', source: 'RBI', sentiment: 'bullish', category: 'rbi', detail: 'Governor Das signals room for rate cut if inflation stays benign.' },
  { headline: 'India signs landmark semiconductor fab deal with key partner', source: 'Livemint', sentiment: 'bullish', category: 'geopolitical' },
  { headline: 'Rupee strengthens past 82 per dollar on strong forex reserves', source: 'Reuters India', sentiment: 'bullish', category: 'macro' },
  { headline: 'India-UAE CEPA: bilateral trade crosses $100 Bn — new era of growth', source: 'ET Now', sentiment: 'bullish', category: 'geopolitical' },
  { headline: 'Japan pledges $42 Bn investment in Indian infra over 5 years', source: 'Business Standard', sentiment: 'bullish', category: 'geopolitical' },
  { headline: 'PM unveils ₹1.5 Lakh Cr PLI expansion for electronics & EVs', source: 'NDTV Profit', sentiment: 'bullish', category: 'macro' },

  // ─── Bearish – Equity ───
  { headline: 'Sensex tanks 800 pts as FIIs dump ₹6,500 Cr — worst session in 3 months', source: 'ET Markets', sentiment: 'bearish', category: 'equity' },
  { headline: 'Nifty slips below 23,000; midcaps bleed with 400+ stocks hitting lower circuit', source: 'Moneycontrol', sentiment: 'bearish', category: 'equity' },
  { headline: 'DII buying fails to offset massive FII sell-off — ₹8,200 Cr outflow', source: 'NDTV Profit', sentiment: 'bearish', category: 'equity', detail: 'DIIs bought ₹3,100 Cr but unable to stem the tide.' },
  { headline: 'Adani Group stocks tumble after fresh Hindenburg-style short report', source: 'Livemint', sentiment: 'bearish', category: 'equity' },
  { headline: 'HDFC Bank Q3 results disappoint — net interest margin contracts', source: 'CNBC-TV18', sentiment: 'bearish', category: 'equity' },
  { headline: 'Pharma stocks crack as US FDA issues import alert to three Indian firms', source: 'Business Standard', sentiment: 'bearish', category: 'sector' },
  { headline: 'IT sector under pressure as NASSCOM lowers FY27 guidance', source: 'ET Now', sentiment: 'bearish', category: 'sector' },
  { headline: 'Real estate stocks plunge as RBI tightens housing loan norms', source: 'Moneycontrol', sentiment: 'bearish', category: 'sector' },

  // ─── Bearish – Macro / RBI ───
  { headline: 'Crude oil spikes to $98/bbl — India\'s import bill set to swell', source: 'Reuters India', sentiment: 'bearish', category: 'macro', detail: 'OPEC+ announces surprise production cut of 1.2 Mn bpd.' },
  { headline: 'Rupee hits all-time low at 86.42 per dollar — RBI intervenes', source: 'Livemint', sentiment: 'bearish', category: 'macro' },
  { headline: 'WPI inflation surges to 6.8% — input cost pressure mounts', source: 'ET Markets', sentiment: 'bearish', category: 'macro' },
  { headline: 'RBI hikes repo rate by 25 bps to 6.75% citing sticky core inflation', source: 'RBI', sentiment: 'bearish', category: 'rbi' },
  { headline: 'Current account deficit widens to 3.2% of GDP — alarm bells ring', source: 'Business Standard', sentiment: 'bearish', category: 'macro' },
  { headline: 'India\'s manufacturing PMI slips to 48.7 — contraction zone', source: 'NDTV Profit', sentiment: 'bearish', category: 'macro' },

  // ─── Bearish – Derivative ───
  { headline: 'Put-Call ratio crashes to 0.65 — bears in full control', source: 'Sensibull', sentiment: 'bearish', category: 'derivative' },
  { headline: 'Massive call writing at 23,000 CE — Nifty faces stiff resistance', source: 'Opstra', sentiment: 'bearish', category: 'derivative' },
  { headline: 'Short buildup in Bank Nifty futures; FIIs add ₹9,800 Cr in shorts', source: 'NSE', sentiment: 'bearish', category: 'derivative' },
  { headline: 'India VIX spikes 22% to 18.5 — traders hedge aggressively', source: 'Moneycontrol', sentiment: 'bearish', category: 'derivative' },

  // ─── Bearish – Geopolitical ───
  { headline: 'Tensions escalate at LAC — India-China border standoff resumes', source: 'NDTV', sentiment: 'bearish', category: 'geopolitical', detail: 'Defence stocks rally but broader market sells off on uncertainty.' },
  { headline: 'US threatens tariffs on Indian pharma exports — trade war fears', source: 'Reuters India', sentiment: 'bearish', category: 'geopolitical' },
  { headline: 'Middle East conflict intensifies — Strait of Hormuz disruption risk', source: 'Bloomberg Quint', sentiment: 'bearish', category: 'geopolitical' },
  { headline: 'SEBI tightens F&O margin rules — retail traders face higher costs', source: 'Livemint', sentiment: 'bearish', category: 'derivative', detail: 'Peak margin requirement increased to 100% from next month.' },
  { headline: 'Russia-Ukraine conflict escalates — global risk-off mode triggered', source: 'ET Now', sentiment: 'bearish', category: 'geopolitical' },

  // ─── Neutral ───
  { headline: 'RBI policy on hold — markets await clarity on liquidity stance', source: 'RBI', sentiment: 'neutral', category: 'rbi' },
  { headline: 'Nifty consolidates in 23,400–23,800 range; awaiting Q3 earnings', source: 'ET Markets', sentiment: 'neutral', category: 'equity' },
  { headline: 'FIIs net neutral — ₹120 Cr sold after ₹300 Cr bought intraday', source: 'Moneycontrol', sentiment: 'neutral', category: 'equity' },
  { headline: 'India VIX stable around 13 — no directional cues from derivatives', source: 'NSE', sentiment: 'neutral', category: 'derivative' },
  { headline: 'US Fed holds rates steady — Powell signals data-dependent approach', source: 'Reuters', sentiment: 'neutral', category: 'global' },
  { headline: 'Quarterly results season begins — TCS kicks off with inline numbers', source: 'CNBC-TV18', sentiment: 'neutral', category: 'equity' },
  { headline: 'Crude oil steadies around $85/bbl — OPEC maintains output targets', source: 'Bloomberg Quint', sentiment: 'neutral', category: 'macro' },
  { headline: 'Rupee trades flat at 83.20/$ — RBI seen capping volatility', source: 'Livemint', sentiment: 'neutral', category: 'macro' },
  { headline: 'India\'s forex reserves at $640 Bn — comfortable import cover', source: 'RBI', sentiment: 'neutral', category: 'macro' },
  { headline: 'Budget session of Parliament begins — key reforms bill in focus', source: 'NDTV', sentiment: 'neutral', category: 'geopolitical' },
  { headline: 'China PMI at 50.1 — teeters on expansion boundary', source: 'Reuters', sentiment: 'neutral', category: 'global' },
  { headline: 'Global bond yields consolidate — 10-year US Treasury at 4.25%', source: 'Bloomberg', sentiment: 'neutral', category: 'global' },
  { headline: 'SEBI exploring T+0 settlement — consultation paper released', source: 'SEBI', sentiment: 'neutral', category: 'derivative' },
  { headline: 'Tech Mahindra restructuring on track — analysts maintain hold rating', source: 'Moneycontrol', sentiment: 'neutral', category: 'sector' },
  { headline: 'India-Canada diplomatic row continues but no trade impact expected', source: 'ET Now', sentiment: 'neutral', category: 'geopolitical' },

  // ─── Extra Bullish ───
  { headline: 'SIP inflows hit record ₹23,000 Cr in January — retail power rising', source: 'AMFI', sentiment: 'bullish', category: 'equity', detail: 'Domestic investors continue to back equity despite FII outflows.' },
  { headline: 'IRCTC stock doubles in 6 months as railway capex doubles in budget', source: 'ET Markets', sentiment: 'bullish', category: 'sector' },
  { headline: 'Tata Electronics first chip fab in Dholera begins trial production', source: 'Livemint', sentiment: 'bullish', category: 'sector' },
  { headline: 'Defence exports cross $3 Bn — HAL, BEL orders at all-time highs', source: 'Business Standard', sentiment: 'bullish', category: 'sector' },
  { headline: 'India included in JPMorgan GBI-EM bond index — $25 Bn inflows expected', source: 'Reuters India', sentiment: 'bullish', category: 'macro' },

  // ─── Extra Bearish ───
  { headline: 'Global recession fears spike — US yield curve inverts further', source: 'Bloomberg', sentiment: 'bearish', category: 'global' },
  { headline: 'China real estate crisis deepens — Evergrande files bankruptcy', source: 'Reuters', sentiment: 'bearish', category: 'global', detail: 'Asian markets sell off on contagion fears; India not spared.' },
  { headline: 'Monsoon deficit at 12% — farm output and rural consumption at risk', source: 'IMD', sentiment: 'bearish', category: 'macro' },
  { headline: 'SEBI investigation into SME IPO irregularities — 5 companies halted', source: 'Moneycontrol', sentiment: 'bearish', category: 'equity' },
  { headline: 'Yen carry trade unwind spooks global markets — Nifty gaps down', source: 'ET Markets', sentiment: 'bearish', category: 'global' },

  // ─── Extra Neutral ───
  { headline: 'Infosys guides 4-7% CC revenue growth for FY27 — meets expectations', source: 'CNBC-TV18', sentiment: 'neutral', category: 'equity' },
  { headline: 'Gold prices hover near ₹72,000/10g — safe haven demand stable', source: 'Livemint', sentiment: 'neutral', category: 'macro' },
  { headline: 'Nifty weekly options expiry — max pain level at 23,600', source: 'Opstra', sentiment: 'neutral', category: 'derivative' },
  { headline: 'India\'s trade deficit narrows marginally to $20.1 Bn in December', source: 'Business Standard', sentiment: 'neutral', category: 'macro' },
  { headline: 'IPO market buzzing — 3 mainboard IPOs opening this week', source: 'Moneycontrol', sentiment: 'neutral', category: 'equity' },
];

// ────────────────────────────────────────────────────────────
// NewsEngine
// ────────────────────────────────────────────────────────────

/**
 * NewsEngine generates periodic market-news headlines whose sentiment mix
 * is influenced by the current VIX regime.
 *
 * - calm / normal  → mostly bullish + neutral
 * - elevated       → balanced
 * - high / extreme → mostly bearish + neutral
 *
 * Emits a `NewsItem` to registered listeners every `intervalMs`.
 */
export class NewsEngine {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private listeners: Array<(item: NewsItem) => void> = [];
  private recentIds = new Set<number>(); // prevent repeats
  private counter = 0;
  private getVIXRegime: () => string;
  private intervalMs: number;

  constructor(getVIXRegime: () => string, intervalMs = 8_000) {
    this.getVIXRegime = getVIXRegime;
    this.intervalMs = intervalMs;
  }

  /** Register listener for new headline events. */
  onNews(listener: (item: NewsItem) => void): void {
    this.listeners.push(listener);
  }

  /** Start the periodic headline generator. */
  start(): void {
    if (this.intervalId) return;

    log.info({ intervalMs: this.intervalMs }, 'News engine started');

    // Emit one immediately
    this.emit();

    this.intervalId = setInterval(() => {
      this.emit();
    }, this.intervalMs);
  }

  /** Stop the engine. */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      log.info('News engine stopped');
    }
  }

  /** Determine the sentiment distribution for the current VIX regime. */
  private getSentimentWeights(): Record<NewsSentiment, number> {
    const regime = this.getVIXRegime();
    switch (regime) {
      case 'calm':
        return { bullish: 0.55, neutral: 0.30, bearish: 0.15 };
      case 'normal':
        return { bullish: 0.40, neutral: 0.35, bearish: 0.25 };
      case 'elevated':
        return { bullish: 0.25, neutral: 0.35, bearish: 0.40 };
      case 'high':
        return { bullish: 0.15, neutral: 0.25, bearish: 0.60 };
      case 'extreme':
        return { bullish: 0.05, neutral: 0.20, bearish: 0.75 };
      default:
        return { bullish: 0.33, neutral: 0.34, bearish: 0.33 };
    }
  }

  /** Pick a sentiment based on weighted probabilities. */
  private pickSentiment(): NewsSentiment {
    const weights = this.getSentimentWeights();
    const r = Math.random();
    if (r < weights.bullish) return 'bullish';
    if (r < weights.bullish + weights.neutral) return 'neutral';
    return 'bearish';
  }

  /** Pick a random headline with the given sentiment, avoiding recent repeats. */
  private pickHeadline(sentiment: NewsSentiment): HeadlineTemplate {
    const pool = HEADLINE_POOL.filter((h, i) => h.sentiment === sentiment && !this.recentIds.has(i));

    // Fallback: if pool is exhausted, clear recents for this sentiment
    if (pool.length === 0) {
      this.recentIds.clear();
      const fullPool = HEADLINE_POOL.filter((h) => h.sentiment === sentiment);
      const idx = Math.floor(Math.random() * fullPool.length);
      return fullPool[idx]!;
    }

    const indices = HEADLINE_POOL
      .map((h, i) => ({ h, i }))
      .filter(({ h, i }) => h.sentiment === sentiment && !this.recentIds.has(i));

    const pick = indices[Math.floor(Math.random() * indices.length)]!;
    this.recentIds.add(pick.i);

    // Keep recents bounded
    if (this.recentIds.size > HEADLINE_POOL.length * 0.6) {
      this.recentIds.clear();
    }

    return pick.h;
  }

  /** Generate and emit one headline. */
  private emit(): void {
    const sentiment = this.pickSentiment();
    const template = this.pickHeadline(sentiment);
    this.counter++;

    const item: NewsItem = {
      id: `news_${Date.now()}_${this.counter}`,
      headline: template.headline,
      source: template.source,
      sentiment: template.sentiment,
      category: template.category,
      timestamp: Date.now(),
      detail: template.detail,
    };

    for (const listener of this.listeners) {
      try {
        listener(item);
      } catch (err) {
        log.error({ err }, 'News listener error');
      }
    }
  }
}
