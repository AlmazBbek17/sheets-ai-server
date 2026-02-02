# Sheets AI Helper - Server

Backend API для расширения Chrome "ИИ Помощник для Google Sheets"

## Что это?

Сервер на Vercel который:
- Принимает запросы от расширения Chrome
- Отправляет в OpenRouter AI
- Возвращает готовые формулы

## Деплой на Vercel

1. Зайдите на https://vercel.com
2. Импортируйте этот репозиторий
3. Добавьте переменную окружения:
   - Name: `OPENROUTER_API_KEY`
   - Value: ваш ключ от OpenRouter
4. Deploy!

## Получение API ключа OpenRouter

1. Зайдите на https://openrouter.ai/
2. Зарегистрируйтесь
3. Settings → API Keys
4. Create Key
5. Скопируйте ключ

Готово!
