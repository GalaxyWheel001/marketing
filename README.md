# Marketing Quiz with Cloaking System

Проект представляет собой маркетинговый квиз с системой клоакинга для защиты от ботов.

## Структура проекта

- **`index.html`** - Основная страница с квизом
- **`netlify/edge-functions/cloaking.ts`** - Edge Function для клоакинга
- **`netlify/edge-lib/`** - Библиотеки для детекции ботов и редиректов
- **`netlify.toml`** - Конфигурация Netlify

## Как работает клоакинг

1. **Детекция ботов**: Система проверяет User-Agent и IP-адрес запроса
2. **Редирект ботов**: Обнаруженные боты перенаправляются на безопасную страницу
3. **Разрешение реальных пользователей**: Реальные пользователи видят контент квиза

## Настройка

### 1. Обновите домены в `netlify/edge-lib/redirect-config.ts`:

```typescript
mainDomain: "your-domain.netlify.app",  // Ваш основной домен
botRedirectUrl: "https://www.google.com",  // URL для редиректа ботов
```

### 2. Настройте Telegram username в `index.html`:

Найдите строку с `telegramUsername` и замените на ваш username.

## Деплой на Netlify

1. Подключите репозиторий к Netlify
2. Настройки деплоя:
   - Build command: (оставьте пустым)
   - Publish directory: `.` (корневая папка)
3. Edge Functions будут автоматически активны после деплоя

## Локальный запуск

```bash
# Запуск простого HTTP сервера
python -m http.server 8000

# Или используйте npm скрипт
npm start
```

Откройте браузер: http://localhost:8000

## Примечания

- Edge Functions работают только на Netlify
- Для локальной разработки клоакинг не активен
- Убедитесь, что ваш основной домен указан в конфигурации





