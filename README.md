# direct-ad.ru — сайт подписки на Яндекс Директ

Тёмный кинематографичный минимализм: «тёмная сцена, один символ, один свет».
Статика на чистом HTML/CSS/JS, без сборщиков и без тяжёлых библиотек.

## Просмотр локально

Эта папка самодостаточна: внутри лежит свой мини-сервер.

```
node dev-server.js 4321
```

Открыть <http://localhost:4321>. Сервер отдаёт чистые URL (`/for-local` →
`for-local.html`) и корректный 404 — то есть ведёт себя как прод.
`dev-server.js` нужен только для просмотра на компьютере, на хостинг он не
кладётся: там те же правила выполняет `.htaccess`.

Другой способ: любой статический хостинг с Apache (`.htaccess` готов) или
edge-платформа с `_redirects` — см. раздел «Публикация» ниже.

## Структура

```
index.html              /
for-local.html          /for-local        ЦА 1 → Старт
for-business.html       /for-business     ЦА 2 → Бизнес
for-scale.html          /for-scale        ЦА 3 → Премиум
subscribe-start.html    /subscribe/start
subscribe-business.html /subscribe/business
subscribe-premium.html  /subscribe/premium
pricing.html            /pricing
quiz.html               /quiz             6 вопросов → ЦА и тариф
checklist.html          /checklist        лид-магнит
checklist-thanks.html   /checklist/thanks noindex
cases.html              /cases
case-1.html … case-4.html  /cases/1…4     заготовки, noindex
about.html              /about
contacts.html           /contacts         #audit #checklist #quiz
privacy.html            /privacy
oferta.html             /oferta
thanks.html             /thanks           noindex
404.html                /404
lp-local.html           /lp/local         посадочные под Директ, noindex
lp-business.html        /lp/business
lp-scale.html           /lp/scale

assets/css/main.css     дизайн-система: токены, 5 брейкпоинтов, нить, формы
assets/js/main.js       шапка, меню, появление, FAQ, нить, липкая кнопка,
                        cookie, валидация и отправка форм, UTM
assets/js/quiz.js       логика квиза
assets/img/             символы (webp+avif), постер, og, favicon, icons.svg
.htaccess               чистые URL, https, кэш, заголовки
robots.txt  sitemap.xml
TILDA-MIGRATION.md      план переноса на Тильду, если передумаешь
```

## Что нужно заполнить перед публикацией

Всё, чего нет в исходных данных, помечено в разметке как
`<span class="ph">ВСТАВИТЬ: …</span>` — это видно на странице жёлтым пунктиром.
Полный список собирается в `PLACEHOLDERS.md`.

Критичное:

| Что | Где |
|---|---|
| Реальные кейсы и цифры | `/cases`, `/cases/1…4`, главная |
| Фото эксперта, ч/б 4:5 | `/about`, главная |
| Телефон | подвал, `/contacts` |
| ИНН / ОГРНИП | подвал, `/privacy`, `/oferta` |
| Номер и дата ERID | подвал всех страниц |
| Число проектов в месяц | главная (утверждение должно быть правдой) |
| PDF чек-листа | `assets/files/direct-checklist.pdf` — сейчас там заглушка на 2 страницы, замени своим файлом с тем же именем |
| Видео Hero, 1080 и 720 | `assets/video/`, раскомментировать `<video>` в `index.html` |
| Адрес обработчика форм | `assets/js/main.js`, константа `ENDPOINT` |

## Формы

Бэкенда пока нет. Без `ENDPOINT` форма честно пишет, что заявка никуда не ушла,
и предлагает написать напрямую — тестовых «отправок» в воздух не будет.

Подключение на выбор:
- `POST` на свой скрипт/CRM-webhook — просто вписать URL в `ENDPOINT`;
- Тильда-форма / Getform / Formspree — поменять `action` и имена полей;
- amoCRM / Битрикс24 — через их вебхук на тот же `ENDPOINT`.

Поля, которые уходят в заявке: `name`, `contact`, `email`, `site`, `tariff`,
`audience`, `source`, все `utm_*`, `yclid`, `page`, `consent`, `sent_at`.

## Аналитика

Счётчик Яндекс Метрики **не вставлен** — по твоему решению.
Все точки уже размечены атрибутом `data-goal` по именам целей из ТЗ, так что
подключение сводится к: номер счётчика в `<head>` + обёртка `ym()` вокруг
кликов по `data-goal` (20 строк в `main.js`).

## Публикация

Статика, подходит любой хостинг с Apache (`.htaccess` готов) или edge-платформа.

- **Cloudflare Pages / Netlify**: publish directory `direct-ad-site`, чистые URL
  из коробки, `.htaccess` игнорируется — вместо него нужен `_redirects`
  (`/*  /:splat  200`) и `_headers` с теми же заголовками.
- **Обычный RU-хостинг**: залить содержимое папки в `public_html`, всё работает.
- Домен `direct-ad.ru` без `www` — редирект с `www` и с http уже в `.htaccess`.

## Что проверялось

Прогнено программно по всем 25 страницам:

- `node tools/check.js` — 923 внутренние ссылки ведут в существующие страницы,
  все ассеты на месте, `.html` в ссылках нет, у всех страниц title / description /
  canonical / og-теги, ровно один `h1`, ни одного класса вне `main.css`,
  23 уникальных `data-goal`.
- 25 страниц в 320px: горизонтального скролла нет ни на одной, цель касания
  в шапке и в футере ≥44px.
- Квиз: 6 вопросов → ЦА и тариф, результат, скрытые поля `audience` / `tariff`
  заполняются, `sessionStorage` перезаписывается, ссылки ведут на нужный тариф.
- Формы: без согласия — «проверьте отмеченные поля»; с согласием и пустым
  `ENDPOINT` — честное «заявка никуда не ушла» с предложением написать напрямую.
  Подвал формы уносят `utm_*`, `yclid`, `page`, `source`.
- JSON-LD: 18 блоков, все парсятся. `sitemap.xml` — 15 URL, все отдают 200 через
  `tools/serve.js`, `/nope` отдаёт 404.html.
- Консоль чистая.

## Чего проверить глазами

Встроенный браузер приложения работает с включённым `prefers-reduced-motion`,
поэтому в нём специально отключены анимации: появления блоков, прочерчивание
нити и липкая кнопка не «оживают». Логика у этих трёх механизм проверена
(атрибуты и классы проставляются верно), но как именно они выглядят в движении
— надо открыть в обычном браузере:

```
node ../tools/serve.js 4321
```

- `http://localhost:4321/` — Hero, появление блоков, постер вместо видео
- `http://localhost:4321/for-local` — нить прочерчивается при скролле
- мобильная ширина (эмуляция устройства в DevTools) — липкая кнопка после Hero
- `http://localhost:4321/quiz` — шаги и результат

## Инструменты (`../tools/`)

| Скрипт | Что делает |
|---|---|
| `serve.js` | локальный сервер с чистыми URL и 404 как на проде |
| `check.js` | приёмка: ссылки, ассеты, SEO-минимум, классы, цели |
| `placeholders.js` | собирает `PLACEHOLDERS.md` из всех меток `.ph` |
| `img.js` / `poster.js` | прогон картинок в WebP + AVIF, сжатие постера |
| `checklist-pdf.js` | пересобирает PDF-заглушку чек-листа |
| `inline-to-class.js` | разовая замена инлайновых `style` на служебные классы |

