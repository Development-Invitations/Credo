# DebtTracker

Приложение для учёта должников и напоминаний. React + Vite + Electron + Supabase.

## Стек
- **React 18 + TypeScript + Vite** — интерфейс
- **Electron** — упаковка в .exe
- **Supabase** — БД (Postgres), аутентификация, Row Level Security
- **i18next** — RU / UZ / TJ / KZ / KG

## Первый запуск

1. Установи зависимости:
   ```bash
   npm install
   ```

2. Настрой Supabase:
   - Открой свой проект на supabase.com → **SQL Editor** → выполни содержимое `supabase/schema.sql`
   - Открой **Project Settings → API**, скопируй `Project URL` и `anon public` ключ
   - Скопируй `.env.example` в `.env` и вставь туда эти значения

3. Запусти в режиме разработки (браузер + Electron одновременно):
   ```bash
   npm run dev
   ```

   Либо только веб-версию для быстрой проверки UI без Electron:
   ```bash
   npx vite
   ```

## Сборка в .exe

```bash
npm run electron:build
```
Файл появится в папке `release/`.

## Структура проекта

```
electron/          — main.js (главный процесс) и preload.js (мост в React)
src/
  i18n/             — переводы (5 языков)
  lib/              — клиент Supabase
  context/          — глобальный стейт (сессия, тема, язык)
  components/       — переиспользуемые UI-элементы (Button, Input)
  pages/
    Onboarding/      — выбор языка → регистрация
    Dashboard/       — личный кабинет с должниками
    Settings/        — тема, язык, версия, обновления
  styles/           — theme.css (токены) + globals.css (единый UI-кит)
supabase/
  schema.sql        — таблицы, RLS-политики, триггер автосоздания профиля
```

## Как работает проверка обновлений

Таблица `app_versions` в Supabase хранит номер актуальной версии и ссылку на .exe.
При входе в **Настройки** приложение сравнивает свою версию (`package.json`, доступна
через `window.electronAPI.getAppVersion()`) с последней записью в этой таблице.
Если версии не совпадают — показывается баннер с кнопкой скачивания.

Чтобы опубликовать новую версию:
1. Подними `version` в `package.json`
2. Собери `.exe` (`npm run electron:build`), выложи файл в GitHub Releases
3. Добавь строку в таблицу `app_versions` (новая версия + прямая ссылка на релиз)

## Дальнейшие шаги (не входят в этот этап)
- Модуль напоминаний (таблица `reminders` уже создана в schema.sql)
- Платёжная система — потребует отдельный бэкенд (PHP/Node) для безопасной
  обработки вебхуков, т.к. секретные ключи платёжного провайдера нельзя
  хранить в Electron-приложении

## Сборка в .exe

```bash
npm run electron:build
```
Готовый установщик появится в папке `release/` (файл вида `Credo Setup 0.1.0.exe`).
Это Windows-инсталлятор (NSIS) — двойной клик ставит приложение как обычную программу,
с ярлыком в меню Пуск и возможностью удаления через "Программы и компоненты".

## Публикация в Git — без установки Git в терминале (через GitHub Desktop)

1. Скачай и установи **GitHub Desktop**: https://desktop.github.com — это отдельная программа
   с окнами и кнопками, Git внутри неё уже встроен, отдельно ставить ничего не нужно.
2. Открой GitHub Desktop → войди под своим GitHub-аккаунтом (тем же, где создан репозиторий
   Development-Invitations/Credo).
3. Меню **File → Add local repository** → нажми **Choose...** → выбери папку `D:\Credo\debt-tracker`.
4. Появится сообщение "This directory does not appear to be a Git repository. Would you like to
   create a repository here instead?" → нажми **Create a repository**.
5. Сверху меню **Repository → Repository settings...** → вкладка **Remote** → в поле
   "Primary remote repository" вставь: `https://github.com/Development-Invitations/Credo.git` → **Save**.
6. Вернись в главное окно — слева появится список изменённых/новых файлов (node_modules, dist,
   release, .env в этот список не попадут — они в `.gitignore`).
7. Внизу слева впиши описание коммита, например "Первая версия Credo" → кнопка
   **Commit to main**.
8. Сверху кнопка **Push origin** — файлы уедут на GitHub.

Дальше для новых изменений — просто открываешь GitHub Desktop, видишь что изменилось,
пишешь короткое описание и жмёшь Commit → Push. Никакой консоли не нужно.

## Сборка в .exe

```bash
npm run electron:build
```
Инсталлятор появится в `release/` (например `Credo Setup 0.1.0.exe`). Мастер установки теперь
полноценный — со своим окном (не "one-click"): можно выбрать папку установки, создаётся ярлык
на рабочем столе и в меню Пуск с именем "Credo".

Если хочешь свою иконку вместо стандартной — положи файл `icon.ico` (256×256 или больше) в
папку `build/` в корне проекта (создай папку `build`, если её нет) — electron-builder подхватит
её автоматически при следующей сборке, ничего в конфиге менять не нужно.

## Как выкатывать обновления, чтобы пользователи их видели

1. Внеси изменения в код
2. Подними версию в `package.json` (`"version": "0.1.1"`)
3. Собери новый инсталлятор: `npm run electron:build`
4. Запушь код: `git add . && git commit -m "v0.1.1" && git push`
5. На GitHub → вкладка **Releases** → **Draft a new release** → тег `v0.1.1` →
   прикрепи файл `.exe` из папки `release/` → Publish
6. На странице опубликованного релиза кликни правой кнопкой на прикреплённый `.exe` →
   "Copy link" — это должна быть **прямая ссылка на файл** (заканчивается на `.exe`),
   а не ссылка на список релизов
7. В Supabase → SQL Editor выполни:
   ```sql
   insert into public.app_versions (version, download_url, release_notes)
   values ('0.1.1', 'ССЫЛКА_НА_EXE_ИЗ_РЕЛИЗА', 'Что изменилось в этой версии');
   ```

После этого шага все, кто пользуется приложением — **даже если уже открыли и вошли
в него до выхода обновления** — увидят жёлтую плашку сверху "Доступна новая версия
Credo v0.1.1" с кнопкой скачать, в течение 5 минут (приложение само периодически
проверяет таблицу `app_versions`, повторную регистрацию/вход делать не нужно).
Плашку также видно в Настройках.
