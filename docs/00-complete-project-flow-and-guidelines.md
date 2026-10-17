# Telegram Cloud Storage — Project Flow and Guidelines

Status: source of truth for implementation. Read this before writing code.
Date: 2026-10-09
Workspace: empty. No application code exists yet.

This document records the product, the architecture, the required flows, and the rules that every later milestone must follow. It is based on the product brief and on official Telegram documentation fetched on 2026-10-09:

- https://core.telegram.org/tdlib
- https://core.telegram.org/tdlib/getting-started
- https://core.telegram.org/tdlib/docs/classtd_1_1td__api_1_1set_tdlib_parameters.html
- https://core.telegram.org/tdlib/docs/classtd_1_1td__api_1_1get_me.html
- https://core.telegram.org/tdlib/docs/classtd_1_1td__api_1_1download_file.html
- https://core.telegram.org/tdlib/docs/classtd_1_1td__api_1_1delete_messages.html
- https://core.telegram.org/api/saved-messages
- https://core.telegram.org/api/files
- https://telegram.org/faq
- https://telegram.org/faq_premium

If a later Telegram method, field, or limit is not confirmed in current official TDLib or Telegram docs, stop and document the uncertainty. Do not invent an API.

---

## 1. What this product is

A web personal cloud drive whose file bytes live only in the signed-in user's own Telegram account, in Saved Messages, which Telegram documents as personal cloud storage.

The user connects their real Telegram account. The web app then feels like a small Google Drive: upload, list, preview, download, delete, folders, search, and the same library on another browser. PostgreSQL stores metadata, folder structure, Telegram references, jobs, and sync state. It never stores file bytes.

```
User
  -> Next.js cloud-drive UI
  -> Application API (Node.js / TypeScript)
  -> TelegramStorageService   (the only Telegram entry point)
  -> TDLib JSON client
  -> That user's Telegram account
  -> Saved Messages (private chat with oneself)
  -> Telegram Cloud
```

PostgreSQL sits beside the API. It is not a storage backend for file contents.

## 2. What this product is not

- Not Google Drive, OneDrive, S3, Firebase Storage, Cloudinary, or any other file host.
- Not a Telegram bot. Bot API must not store user files.
- Not a hand-written MTProto client.
- Not one shared Telegram account for every user.
- Not a way to bypass Telegram limits, file-size caps, or API terms.
- Not an Android, iOS, or desktop app in this phase.
- Not automatic photo or gallery backup. That is a later phase.

Telegram is the only storage backend.

## 3. Current scope

Web MVP only. Build it in milestones. Do not implement the dashboard until Telegram authentication is reliable.

In scope for the first working slice (Milestones 1–3, then stop):

1. Backend process starts.
2. TDLib starts.
3. User authorizes with TDLib's own authorization states.
4. `authorizationStateReady` is reached.
5. `getMe` returns the authenticated Telegram user.
6. Results are logged without secrets.

File upload, download, delete, PostgreSQL, and the web UI come only after that slice is stable. The full web MVP (Milestones 4–10) is specified below so later work does not drift, but it is not the next coding task.

Out of scope until a later product phase: mobile apps, background backup, Wi-Fi-only or charging-only backup, gallery view, duplicate detection, free-up-device-storage, offline queue, automatic sync, trash, favorites, sharing, public links, application-level end-to-end encryption, storage analytics.

## 4. Environment inspected on 2026-10-09

| Tool | Result | Meaning |
| --- | --- | --- |
| Node.js | v22.14.0 | Fine for the API and Next.js. |
| npm | 11.8.0 | Fine. |
| Git | 2.55.0.windows.2 | Fine. |
| Python | 3.11.1 | Present. Not required for the Node MVP. |
| CMake | Not installed | Cannot build TDLib from source yet. |
| MSVC `cl` | Not on PATH | No usable Visual C++ toolchain in this shell. |
| MinGW `gcc` / `g++` | 6.3.0 (2016) | Too old to build current TDLib. |

Milestone 1 is blocked until one of these is chosen and verified:

- Install a current Windows toolchain (CMake plus a modern MSVC or a current MinGW/Clang) and build TDLib from the official source, or
- Use an official TDLib prebuilt `tdjson` binary and talk to it only through the JSON interface.

Do not start coding against a guessed binding. Record which binary or build is used, its version, and where `tdjson` comes from.

## 5. System shape

Monorepo. One deployable web app and one API process. Telegram logic lives in one service. Do not split into microservices for the MVP.

```
/
├── apps/
│   ├── web/                 Next.js, TypeScript, React, Tailwind
│   └── api/                 Node.js, TypeScript HTTP API
├── packages/
│   ├── shared/              Pure helpers shared by web and api
│   └── types/               Shared DTO and status types
├── services/
│   └── telegram/            TelegramStorageService and TDLib client only
├── prisma/                  Schema and migrations
├── docs/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

Runtime picture:

```
Browser
  |  HTTPS, app session cookie
  v
API
  |-- PostgreSQL: users, folders, file metadata, jobs, sync
  |
  +-- TelegramStorageService
        |-- one TDLib client per application user
        |-- isolated database_directory and files_directory
        v
      TDLib -> Telegram -> Saved Messages
```

The API process is a temporary pipe during upload and download. It is not the place files live.

## 6. Two sources of truth

| Source | Owns |
| --- | --- |
| Telegram Cloud, via Saved Messages | File bytes, Telegram message, Telegram file identity |
| PostgreSQL | App user, folder tree, display name, mime, size, status, Telegram references, jobs, sync cursor |

Rules:

- A file is `UPLOADED` only after Telegram confirms the send (`updateMessageSendSucceeded`, or an equivalent confirmed sent message with no `sending_state`). Accepting the `sendMessage` request is not confirmation.
- Database metadata is deleted or marked deleted only after Telegram confirms `deleteMessages`.
- A user can delete or edit Saved Messages in the official Telegram app. Our rows can then be stale. The MVP sync is an explicit `POST /api/sync`, not a background daemon.
- App folders are not Telegram chat folders and not Saved Message dialogs. They exist only in PostgreSQL.
- The UI identifier is our file id and folder id. `telegramMessageId` and `telegramFileId` never appear as the main id in the interface.

## 7. Telegram rules that the code must follow

These come from official docs, not from tutorials.

### 7.1 TDLib, not MTProto and not Bot API

TDLib is the client. It owns networking, encryption, and its local database. The application sends requests and handles updates in the order they arrive.

JSON interface concept: send a request, match the response with `@extra`, and also handle updates that are not responses. Authorization, upload progress, and download progress arrive as updates.

Important updates:

- `updateAuthorizationState` — required. Authorization is driven by this update.
- `updateNewChat`, `updateUser` — TDLib guarantees these arrive before the corresponding id is returned. Cache them. Do not assume a later `getChat` or `getUser` is required to learn about an object TDLib already pushed.
- `updateNewMessage`
- `updateMessageSendSucceeded`
- `updateMessageSendFailed` (handle failure; confirm the exact class name in the TDLib version we pin)
- `updateFile` — required to track upload and download progress
- `updateMessageContent` — a message's file info can change after send

### 7.2 Authorization is a state machine

The first state is always `authorizationStateWaitTdlibParameters`. The app calls `setTdlibParameters` and then only reacts to the next `updateAuthorizationState`. If `setTdlibParameters` fails, the state does not change and the app must handle that same state again.

Official parameters we must set (do not hard-code secrets):

- `use_test_dc`: false for production
- `database_directory`: per-user directory under `TDLIB_DATA_DIR`
- `files_directory`: per-user directory, separate from the database directory
- `database_encryption_key`: per-user key, stored encrypted on the server, never sent to the browser
- `use_file_database`, `use_chat_info_database`, `use_message_database`: true so a restart can resume the session
- `use_secret_chats`: false for this product. We do not need secret chats.
- `api_id`, `api_hash`: from https://my.telegram.org via environment variables
- `system_language_code`, `device_model`, `application_version`: non-empty

States the official getting-started page says can appear before ready:

- `authorizationStateWaitPhoneNumber`
- `authorizationStateWaitEmailAddress`
- `authorizationStateWaitEmailCode`
- `authorizationStateWaitCode`
- `authorizationStateWaitRegistration`
- `authorizationStateWaitPassword`
- `authorizationStateReady`

The product brief names the phone, code, password, and ready states. The implementation must also handle email and registration states, because current TDLib can emit them. Any unrecognized authorization state stops the flow, logs only the state type, and returns a user-safe error. Do not invent a custom login protocol.

Expected user-facing flow:

```
Connect Telegram
  -> authorizationStateWaitTdlibParameters
  -> setTdlibParameters
  -> authorizationStateWaitPhoneNumber
  -> setAuthenticationPhoneNumber
  -> authorizationStateWaitCode
       (or email states, which must be handled, not ignored)
  -> checkAuthenticationCode
  -> authorizationStateWaitPassword   only if 2FA is enabled
  -> checkAuthenticationPassword
  -> authorizationStateReady
  -> getMe
  -> persist Telegram user id, names, username, session pointer
```

Never log the phone code, the 2FA password, `api_hash`, the database encryption key, or TDLib database contents.

### 7.3 Saved Messages

Official definition: Saved Messages is the private chat with oneself. Messages sent directly to oneself are stored in that chat and in a saved dialog whose peer is the user.

After `authorizationStateReady`:

1. `getMe` to learn the current user.
2. Open the self chat through the TDLib method that creates or returns the private chat with that user id (`createPrivateChat` in current TDLib). Store the `chat.id` TDLib returns. Do not hard-code a chat-id formula.
3. Send files into that chat.
4. Read them back with chat history on that chat id.

Do not use Telegram saved-dialog tags, saved-dialog folders, or chat folders as our folder tree. Those are Telegram client features, and tags are a Premium reaction feature. Our folders are rows in PostgreSQL.

### 7.4 Files

Upload path in TDLib terms:

- `sendMessage` to the Saved Messages chat id.
- Content is `inputMessageDocument` for generic files. Photos and videos may use their specific input types when we want Telegram to treat them as media. For the first upload test, one document via `inputFileLocal` is enough.
- Local path must be a path the API process can read, not a browser path.
- Progress comes from `updateFile`.
- Success comes from `updateMessageSendSucceeded`.
- Then store `message.id` and the file id inside the message content. Also store `remote.id` when TDLib provides it, because local file ids are not stable across caches the way remote ids are.

Download path:

- `downloadFile` for the stored Telegram file id.
- `synchronous: true` is acceptable for the MVP. Progress still arrives as `updateFile`.
- Stream the completed temp file to the browser, then delete the API's extra temp copy.
- TDLib keeps its own file cache inside `files_directory`. That cache is session working state, not our storage product. Do not build a second permanent cache. After a successful stream, delete the local TDLib file copy when the pinned TDLib version documents a safe way to do that. Confirm the method name in that version before calling it.

Delete path:

- `deleteMessages` on the Saved Messages chat id and the stored message id.
- For a message in the chat with oneself, confirm in the pinned TDLib version whether `revoke` must be true. Do not guess. Check `messageProperties` (`can_be_deleted_only_for_self`, `can_be_deleted_for_all_users`) before deleting.
- Only after TDLib returns success, mark the database row deleted.

### 7.5 Limits and policy

From Telegram's own FAQ and Premium FAQ, as of this writing:

- Standard accounts: files up to 2 GB each.
- Premium accounts: uploads up to 4 GB each. Any user can download a file a Premium user uploaded.
- Telegram describes cloud storage for messages and media. This product must not promise unlimited storage, must not try to evade those limits, and must not market itself as a limit bypass.

The API rejects an upload that exceeds the account's applicable limit before calling TDLib. Exact part-count fields live in Telegram client config (`upload_max_fileparts_default`, `upload_max_fileparts_premium` on https://core.telegram.org/api/config). Prefer the limit Telegram reports for the account over a hard-coded number, and re-check the FAQ when implementing upload.

## 8. Session architecture

One application user, one Telegram user, one TDLib session.

```
User A -> sessions/<userA-id>/database
       -> sessions/<userA-id>/files
       -> encryption key known only to the API

User B -> a different directory and a different key
```

Rules:

- No shared TDLib account and no shared database directory.
- Session files stay on the API machine. The browser never receives them, lists them, or sees the encryption key.
- `TDLIB_DATA_DIR` is outside the web root and outside Git.
- `.gitignore` must include `.env`, `node_modules`, TDLib build trees, `sessions/`, `tdlib-data/`, `*.tdb`, and any local file cache.
- Losing the encryption key makes that TDLib database unreadable (TDLib returns code 401 for a wrong key). Key storage is part of Milestone 1 design even if the first login is a single local developer.
- For the MVP, one API process owns all live TDLib clients. Do not design multi-server session stealing. Horizontal scaling is explicitly deferred.
- Shut down clients with TDLib's close/log-out flow. Do not delete a session directory while the client is open.

Application login is separate from Telegram authorization:

- Telegram authorization proves the Telegram account and creates the TDLib session.
- The app session is an HTTP-only, Secure, SameSite cookie signed with `SESSION_SECRET`.
- Every file and folder query filters by the app user id from that cookie. Ownership is checked in the service, not only in the UI.

## 9. Flows

### 9.1 Connect and authorize

```
Browser                    API                         TDLib
  | Connect Telegram        |                            |
  |------------------------>| create pending auth        |
  |                         | open isolated client       |
  |                         |<-- WaitTdlibParameters ----|
  |                         | setTdlibParameters         |
  |                         |<-- WaitPhoneNumber --------|
  |<----- ask for phone ----|                            |
  | phone ----------------->| setAuthenticationPhoneNumber
  |                         |<-- WaitCode (or email) ----|
  | code ------------------>| checkAuthenticationCode    |
  |                         |<-- WaitPassword? ----------|
  | password (if asked) --->| checkAuthenticationPassword
  |                         |<-- Ready -------------------|
  |                         | getMe                      |
  |                         | save User + TelegramSession|
  |<----- app session ------|                            |
```

Rate-limit start, code, and password routes. Wrong code and wrong password return a generic user-facing message. Internal logs get an error code, never the submitted secret.

Logout calls TDLib `logOut` (confirm the exact method on the pinned version), then clears the app cookie and marks the session revoked. Do not leave a ready client running after logout.

### 9.2 Upload

```
Browser selects file
  -> API validates session, size, type, and sanitized name
  -> API writes a short-lived temp file outside the web root
  -> File row is created as PENDING, then UPLOADING
  -> TelegramStorageService.send to Saved Messages
  -> updateFile reports progress
  -> updateMessageSendSucceeded
  -> row becomes UPLOADED with chat id, message id, file id, remote id
  -> API deletes its temp file
  -> browser shows the file by application id
```

On `updateMessageSendFailed`, timeout, or process crash before confirmation: status `FAILED`. The row stays for diagnosis. The temp file is removed. The UI does not show it as stored.

### 9.3 Download

```
Browser requests application file id
  -> API checks owner
  -> TelegramStorageService.downloadFile
  -> stream bytes to the response
  -> delete API temp copy
  -> do not write a permanent copy under the app
```

If the Telegram file is gone, return "file unavailable" and record a sync issue. Do not leak TDLib error text.

### 9.4 Delete

```
Browser deletes application file id
  -> API checks owner
  -> status DELETING
  -> deleteMessages on the stored chat and message
  -> Telegram ok
  -> status DELETED (or row removed, but only after ok)
```

If Telegram fails, the row stays `UPLOADED` or moves to a failed-delete state that can be retried. Never the reverse order.

### 9.5 Folders

Folders are a tree: `id`, `userId`, `parentId`, `name`, timestamps. A file points at `folderId`.

- Create, rename, move, and delete folders change only PostgreSQL in the MVP.
- Deleting a folder does not delete Telegram messages until the user deletes the files. A non-empty folder delete is rejected or defined explicitly before implementation. Default for MVP: reject delete when the folder still has children or files.
- Moving a file changes `folderId` only. The Telegram message stays in Saved Messages.

### 9.6 List, search, preview

List and search read PostgreSQL. They do not download file bytes.

Search matches file name, MIME type, and folder name for the current user.

Preview:

- Images: jpeg, png, webp, gif when the browser can show it.
- PDF: browser PDF view.
- Video: browser-native video only when the bytes are a format the browser plays.
- Everything else: icon, name, size, download.

Preview uses the same authorized download stream. No public file URL.

### 9.7 Sync

`POST /api/sync` loads recent messages from the Saved Messages chat and compares message ids with `File` rows.

- Message missing in Telegram, row still `UPLOADED`: mark the row so the UI shows it as missing in Telegram. Do not pretend the bytes exist.
- Message present in Telegram, no row: leave it out of the drive until we define an import. The first MVP does not auto-import the user's whole Saved Messages history, because those messages may be normal notes and forwards, not drive uploads. Document this limitation in the UI later.
- Matching ids: refresh size and remote file id if Telegram changed them.

`GET /api/sync/status` returns the last run time and the last error code.

## 10. Data model

PostgreSQL + Prisma. No bytea file payloads.

User

- id, telegramUserId (unique), username, firstName, lastName, createdAt, updatedAt

TelegramSession

- id, userId
- dataDirectory (server path, never returned by the API)
- encryption key stored encrypted with a server key derived from `SESSION_SECRET` or a dedicated secret, using a standard library (Node `crypto`), not a custom cipher
- auth state, lastReadyAt, createdAt, updatedAt

Folder

- id, userId, parentId nullable, name, createdAt, updatedAt
- unique (userId, parentId, name)

File

- id, userId, folderId nullable
- name, mimeType, size
- telegramChatId, telegramMessageId, telegramFileId, telegramRemoteId nullable
- status: `PENDING | UPLOADING | UPLOADED | FAILED | DELETING | DELETED`
- createdAt, updatedAt

UploadJob / DownloadJob

- id, fileId, userId, state, errorCode, progress, createdAt, updatedAt

SyncState

- id, userId, lastSyncedAt, lastErrorCode, cursor nullable

FileVersion is optional and is not built now.

## 11. API

All routes require the app session except the Telegram connect routes, which create that session. Every id is checked against the caller.

```
POST   /api/auth/telegram/start
POST   /api/auth/telegram/code
POST   /api/auth/telegram/password
POST   /api/auth/telegram/logout
GET    /api/auth/telegram/status

GET    /api/files
GET    /api/files/:id
POST   /api/files/upload
GET    /api/files/:id/download
DELETE /api/files/:id
POST   /api/files/:id/move

GET    /api/folders
POST   /api/folders
PATCH  /api/folders/:id
DELETE /api/folders/:id

GET    /api/search?q=

POST   /api/sync
GET    /api/sync/status
```

Errors returned to the browser: stable code plus a short safe message. No stack traces, no TDLib JSON, no phone, no hash.

| Situation | Safe message |
| --- | --- |
| Bad code | The code is incorrect. Request a new one and try again. |
| 2FA needed | Telegram asked for the account password. |
| Wrong 2FA password | The password was not accepted. |
| Session expired | Connect Telegram again. |
| Telegram unreachable | Telegram is unavailable. Try again shortly. |
| Upload failed | The file was not saved to Telegram. |
| Download failed | The file could not be downloaded. |
| Not found or not owner | Not found. |
| File too large | This file is larger than Telegram allows for the account. |

## 12. Web UI, when the backend slice is stable

Pages:

- `/` landing and connect
- `/connect/telegram` phone, code, 2FA
- `/dashboard` drive home
- `/files`
- `/photos`, `/videos`, `/documents` (filters on MIME, not separate storage)
- `/folder/[id]`
- `/settings`

Dashboard: sidebar (My Drive, Photos, Videos, Documents, Recent, Settings), upload, new folder, search, grid or list, breadcrumbs, upload progress. Favorites and Trash are labels for later, not features now.

React components render data. They do not call TDLib, do not hold folder rules, and do not decide upload success.

## 13. Security checklist

- `TELEGRAM_API_HASH` and `TELEGRAM_API_ID` only in the API environment.
- No secrets in source, logs, or the Next.js client bundle.
- HTTP-only session cookie. `Secure` in production. HTTPS in production.
- CSRF protection on cookie-authenticated mutations.
- Authorize every file, folder, download, and sync by owner.
- Sanitize file names. Strip path separators. Reject `..`.
- Temp files use random names in a dedicated directory. No user-controlled path.
- Validate size and a conservative type allow-list before TDLib sees the file.
- Rate-limit auth routes and upload/download routes.
- Encrypt the TDLib database key at rest with Node's built-in crypto.
- Do not commit `.env` or session directories.
- Do not log OTP, Telegram password, API hash, encryption keys, session dumps, or file contents.

## 14. Logging

Structured JSON logs: timestamp, request id, user id when known, operation, duration, outcome, internal error code.

Forbidden fields: code, password, api hash, encryption key, database path contents, file bytes, raw TDLib authorization payloads that include those secrets.

## 15. Tests to add with each milestone

Authentication: ready path, wrong code, password required, logout.

Files: upload confirmed only after Telegram success, download, delete order, metadata written, failed upload, failed download.

Folders: create, rename, move, delete of an empty folder, reject non-empty delete.

Authorization: user A cannot read or change user B's files or folders.

TDLib integration tests need a real or test DC account and must be opt-in. Unit tests mock `TelegramStorageService`.

## 16. Environment variables

`.env.example` only. Real values stay in `.env`, which is gitignored.

```
TELEGRAM_API_ID=
TELEGRAM_API_HASH=
DATABASE_URL=
APP_URL=
API_URL=
SESSION_SECRET=
TDLIB_DATA_DIR=
```

Add later, still not committed: the key-encryption secret if it is separated from `SESSION_SECRET`, and the pinned TDLib version.

## 17. Milestones and stop rules

| # | Goal | Stop when |
| --- | --- | --- |
| 1 | TDLib process starts | Client created, parameters accepted, or a documented toolchain blocker |
| 2 | Authorization | Phone, code, and 2FA states work through official updates |
| 3 | Current user | `getMe` after `authorizationStateReady` |
| 4 | Saved Messages | Self chat id resolved and history readable |
| 5 | Upload one test file | Message id and file id logged after send success |
| 6 | Download that file | Bytes match the source |
| 7 | Delete that file | Telegram delete succeeds, then metadata matches |
| 8 | PostgreSQL | References stored, no bytes in the database |
| 9 | HTTP API | Upload, list, download, delete behind ownership checks |
| 10 | Web dashboard | A user can do those actions in the browser |

Do not start Milestone 5 until Milestones 1–3 are reliable.

The next coding task is Milestone 1 and Milestone 2 only: monorepo skeleton, TypeScript, `.env.example`, `.gitignore`, the `TelegramStorageService` interface, the smallest TDLib client, and authorization through `authorizationStateReady` and `getMe`. Then stop and report how to run it.

## 18. Guidelines for every change

1. Keep every TDLib call inside `services/telegram`.
2. Controllers and React components depend on the service interface, not on TDLib types.
3. Strong TypeScript. No `any` on the service boundary.
4. Database access stays in repositories or services.
5. One simple API process. No extra services "for later".
6. Verify each new TDLib method against the docs for the pinned version before using it.
7. If a capability is unclear, write the uncertainty into `docs/` and stop.
8. Small, testable steps. Do not rewrite a working session design without a reason.
9. User-facing errors stay generic. Logs stay structured and free of secrets.
10. Stay inside Telegram's documented limits and terms.

## 19. Known uncertainties to resolve at implementation time

- Milestone 1 decision, 2026-10-09: this Windows machine has no CMake and only GCC 6.3, so TDLib is not built from source. The API loads `tdjson.dll` from `prebuilt-tdlib` and talks to it through `tdl`'s JSON client. Confirm the installed TDLib version from that package after `npm install`.
- Exact request fields were checked against `td_api.tl` on master on 2026-10-09. Re-check them when the pinned TDLib version changes. In particular, `setAuthenticationPhoneNumber` takes `settings` and the docs say to pass null for defaults; `registerUser` takes `disable_notification`.
- `authorizationStateWaitPremiumPurchase` is a current TDLib state. The login flow stops with a safe error. It does not attempt a purchase.
- Whether `deleteMessages.revoke` must be true for Saved Messages on that version.
- Whether `createPrivateChat` is still the correct way to obtain the self chat on that version. The Saved Messages concept is documented; the call sequence must be re-read in the pinned TDLib docs.
- How Telegram reports the current account's max upload size to TDLib. Until that is confirmed, block only absurd sizes in the skeleton and enforce the FAQ limits (2 GB, or 4 GB when the account is Premium) once `getMe` shows premium state.
- Email-code and registration states are implemented from the schema checked on 2026-10-09. Apple ID and Google ID sign-in are not implemented; the flow asks for the email address and email code instead.

## 20. Milestone 1–2 status

Implemented in the repo. TDLib 1.8.67 is loaded from `prebuilt-tdlib` through `tdl`. `npm run tdlib:check` loads `tdjson.dll`. A live client reaches `authorizationStateWaitTdlibParameters` and then `authorizationStateWaitPhoneNumber`.

`authorizationStateReady` and `getMe` run only after the account owner completes `npm run auth` with `TELEGRAM_API_ID`, `TELEGRAM_API_HASH`, the Telegram code, and the 2FA password when Telegram asks for it. Do not start file upload until that login has succeeded on a real account.
