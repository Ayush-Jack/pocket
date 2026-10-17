# Pocket

Your Files. Your Space.

Pocket is a personal drive for one Telegram account. The files themselves stay in that account's Saved Messages. PostgreSQL stores only the file details: name, size, type, and status. The browser never sees the Telegram session or the API hash.

## What you can do

- Sign the Telegram account in once from the terminal.
- Open the web app and upload one file or many files.
- Browse All files, Photos, Videos, and Documents.
- Open a photo or video, then download or delete it.
- Files larger than 2 GB are stopped before the upload starts.

Photos and videos show in the card. The file name and Download appear when you open the item. Deleted files stay out of the lists.

## Requirements

- Node.js 22 or newer
- PostgreSQL
- A Telegram API ID and API hash from [my.telegram.org](https://my.telegram.org)
- Windows x64, macOS, or Linux

TDLib comes from `prebuilt-tdlib` (TDLib 1.8.67). The app uses the official JSON client (`tdl`). It does not use the Bot API and it does not speak MTProto itself.

## Setup

```powershell
cd "d:\Project\telegram drive"
copy .env.example .env
npm install
```

Fill `.env`:

- `TELEGRAM_API_ID` and `TELEGRAM_API_HASH`
- `DATABASE_URL` for your local PostgreSQL database
- `SESSION_SECRET` with at least 16 random characters
- `APP_URL=http://localhost:3000`
- `API_URL=http://localhost:4000`

Create the tables:

```powershell
npm run db:migrate
```

## Run

Use two terminals.

```powershell
npm run dev
```

```powershell
npm run web
```

The API listens on port 4000. The site is [http://localhost:3000](http://localhost:3000).

The first time, authorize Telegram before the site can save files:

```powershell
npm run auth
```

The prompt asks for the phone number, the code Telegram sends, and the 2FA password if the account has one. When it reaches `authorizationStateReady`, the account is signed in. The session stays in `.tdlib-data/` on this computer. Do not commit that folder, `.env`, or the encryption key.

## Use the app

1. Open Pocket in the browser.
2. Choose one or more files. Each chosen file stays in the list, even if you open the picker again.
3. Press Upload. Files are saved one after another.
4. Open Photos, Videos, or Documents from the sidebar.
5. Click a photo or video to see the name and Download.
6. Delete removes it from Telegram first, then from the list.

Keyboard shortcuts are listed with `?`.

| Key | Action |
| --- | --- |
| 1–4 | All files, Photos, Videos, Documents |
| 5 | Settings |
| 6 | Developer |
| U | Choose files |
| Left / Right | Previous or next open photo |
| Esc | Close the open item or the shortcut list |

## Developer

Pocket is built by Ayush Srivastava.

- GitHub: [github.com/Ayush-Jack](https://github.com/Ayush-Jack)
- LinkedIn: [linkedin.com/in/ayush-srivastava0110](https://www.linkedin.com/in/ayush-srivastava0110/)
- Portfolio: [ayushsrivastava.me](https://www.ayushsrivastava.me/)

The same page is in the app at [http://localhost:3000/developer](http://localhost:3000/developer).
