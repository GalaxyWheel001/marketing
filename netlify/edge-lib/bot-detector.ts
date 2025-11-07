// Утилиты для детекции ботов и определения редиректов

export interface BotInfo {
  isBot: boolean;
  type: string;
  userAgent: string;
  ip?: string;
}

// Список User-Agent'ов для ботов, модераторов и проверок
const BOT_UA_REGEX = /bot|crawl|spider|facebookexternalhit|facebot|slurp|mediapartners|adsbot|bingpreview|twitterbot|linkedinbot|embedly|quora|pinterest|crawler|python-requests|axios|wget|fetch|telegrambot|vkshare|whatsapp|skypeuripreview|discordbot|applebot|snapchat|google|yahoo|baidu|yandex|duckduckbot|curl|scrapy|httpclient|postman|insomnia/i;

// Диапазоны IP, часто используемые Meta/Facebook/TikTok/Google для проверки
const BLOCKED_IP_RANGES = [
  /^31\.13\./,     // Facebook/Meta
  /^157\.240\./,   // Facebook/Meta
  /^185\.60\./,    // Facebook/Meta
  /^66\.220\./,    // Facebook/Meta
  /^69\.63\./,     // Facebook/Meta
  /^173\.252\./,   // Facebook/Meta
  /^204\.15\.20\./,// TikTok
  /^23\.235\./,    // Google cache
  /^66\.249\./,    // Googlebot
  /^157\.55\./,    // Bing
  /^207\.46\./,    // Microsoft
  /^40\.77\./,     // Microsoft
  /^52\.167\./,    // Microsoft
  /^13\.107\./,    // Microsoft
];

// Проверка на бота по User-Agent и IP
export function isBot(request: Request): BotInfo {
  const userAgent = request.headers.get("user-agent") || "";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
             request.headers.get("x-real-ip") || 
             request.headers.get("cf-connecting-ip") || "";

  // Проверка по User-Agent
  const isBotUA = !userAgent || BOT_UA_REGEX.test(userAgent);
  
  // Проверка по IP
  const isBlockedIP = ip ? BLOCKED_IP_RANGES.some((regex) => regex.test(ip)) : false;
  
  const isBotDetected = isBotUA || isBlockedIP;
  
  let botType = "unknown";
  if (isBotUA) {
    if (userAgent.includes("facebook") || userAgent.includes("meta")) {
      botType = "facebook";
    } else if (userAgent.includes("google")) {
      botType = "google";
    } else if (userAgent.includes("bing")) {
      botType = "bing";
    } else if (userAgent.includes("twitter")) {
      botType = "twitter";
    } else if (userAgent.includes("linkedin")) {
      botType = "linkedin";
    } else if (userAgent.includes("telegram")) {
      botType = "telegram";
    } else if (userAgent.includes("discord")) {
      botType = "discord";
    } else if (userAgent.includes("whatsapp")) {
      botType = "whatsapp";
    } else if (userAgent.includes("python") || userAgent.includes("curl") || userAgent.includes("wget")) {
      botType = "scraper";
    } else {
      botType = "generic_bot";
    }
  } else if (isBlockedIP) {
    botType = "blocked_ip";
  }

  return {
    isBot: isBotDetected,
    type: botType,
    userAgent,
    ip
  };
}

// Получение URL для редиректа ботов
export function getRedirectUrl(fallbackUrl: string, originalUrl: URL): string {
  // Можно добавить логику для разных типов ботов
  return fallbackUrl;
}

// Проверка, является ли запрос от реального пользователя
export function isRealUser(request: Request): boolean {
  const botInfo = isBot(request);
  return !botInfo.isBot;
}





