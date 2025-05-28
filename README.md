# Dentak CRM

Система управления стоматологической клиникой.

## Технологии

- Next.js 15.2.4
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- Radix UI
- Shadcn/ui

## Функциональность

- Управление пациентами
- Управление врачами
- Расписание приёмов
- Медицинские карты
- Управление услугами
- Выставление счетов
- 3D визуализация зубов

## Установка

```bash
# Установка зависимостей
pnpm install

# Запуск в режиме разработки
pnpm dev

# Сборка для продакшена
pnpm build

# Запуск продакшен версии
pnpm start
```

## Окружение

Создайте файл `.env.local` со следующими переменными:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Лицензия

MIT 