# OSAMU GROUP V999

Premium blue-style Telegram Group Help & Moderation Bot powered by **Node.js, TypeScript, Telegraf, and MongoDB**.

## Core behavior

This bot uses an owner-first approval model. When the bot is added to a group, it automatically sends an approval request to the accounts listed in `OWNER_IDS`. Until approval, group features are blocked. After approval, the owner can grant individual permissions to admins instead of giving every admin full control.

The current foundation includes owner approval, owner panel, granular moderation permissions, button-only group controls, welcome templates, verification buttons, link filtering, mod logs, analytics, MongoDB persistence, nested inline-button menus, and a blue premium visual style. No slash commands are required for the interaction flow.

## Setup

1. Create a bot with BotFather and keep the token private.
2. Copy `.env.example` to `.env`.
3. Set `BOT_TOKEN`, `MONGODB_URI`, and comma-separated numeric `OWNER_IDS`.
4. Add the bot to a group and grant the administrator permissions it needs to delete messages, restrict members, and ban members.
5. Run `npm install`, then `npm run build`, then `npm start`.
6. After the bot is added to a group, use the approval button sent to the owner. The owner then controls the group entirely through inline buttons.

For development, use `npm run dev`.

## Render deployment

This repository includes `render.yaml`. In Render, choose **New Blueprint**, connect this private repository, and deploy the blueprint. Ensure the service root directory is the repository root, not `src/`. The service listens on Render's `PORT` value, binds to `0.0.0.0`, and exposes `GET /health` for health checks. The root path also returns a small JSON readiness response.

Set these secret environment variables in Render: `BOT_TOKEN`, `MONGODB_URI`, and `OWNER_IDS`. `PORT` is set to `10000` by the blueprint but the application also respects any port supplied by Render. The build command is `npm ci --include=dev && npm run build`, and the start command is `npm run start`. The start script also runs `npm run build` before launching, so `dist/index.js` is recreated even if a Render service was previously saved with an outdated build command.

MongoDB Atlas should allow the Render service's outbound network access and use a database user with a strong password. Do not commit the real bot token or MongoDB URI.

## Button-only interaction map

Every inline button is now connected to a callback handler with owner authorization, callback acknowledgement, database update where applicable, and an error fallback. Owner menu cards route to group selection, security toggles refresh their screen after saving, moderation buttons write audit logs, welcome photo starts a photo-upload state and stores the Telegram `file_id`, and admin grant/revoke opens a Telegram administrator picker. If an action fails, the callback is acknowledged and a visible recovery message is sent instead of leaving the button spinner running.

| Command | Purpose |
|---|---|
| Any private message from owner | Opens the owner control center |
| `/approved` from the Telegram group creator | Activates that group after Telegram creator verification; this is the only approval exception to the button-only UI |
| Group added event | Sends an approval button to the owner |
| Group approval button | Activates the selected group |
| Group selector button | Opens per-group controls |
| Moderation buttons | Opens lock, unlock, purge, and slow-mode controls |
| Welcome buttons | Selects blue/premium templates and format help |
| Security toggles | Turns link filter, anti-flood, verification, and auto-delete on/off |
| Admin buttons | Lists admins and opens permission workflows |
| Analytics button | Shows joins, warnings, and action statistics |
| Verification button | Verifies a new member without commands |

## Welcome placeholders

Welcome templates support `{mention}`, `{first_name}`, `{username}`, `{user_id}`, `{chat_title}`, and `{count}`. Example:

```text
💙 မင်္ဂလာပါ {mention}
{chat_title} မှ ကြိုဆိုပါတယ်။
သင့် username: {username}
Rules ကိုဖတ်ရန် အောက်က button ကိုနှိပ်ပါ။
```

Telegram inline buttons cannot have arbitrary custom colors. The bot uses blue-themed wording, emoji icons, nested menus, status indicators, and future Web Dashboard theming to create the visual style.

## Permission model

Permissions are stored per group and per admin in MongoDB. Available permission keys are `manage_settings`, `moderate`, `filters`, `welcome`, `broadcast`, `tickets`, `analytics`, `custom_commands`, `points`, and `logs`. Example: reply to an admin message with `/grant moderate`; later use `/revoke moderate` to remove only that permission. Owner IDs always bypass permission checks; normal admins do not.

## Planned expansion modules

The architecture is ready for anti-flood, anti-raid, bad-word filters, whitelist/blacklist, slow mode, lock modes, scheduled announcements, custom commands, tickets, reports, points, levels, badges, leaderboard, admin notes, multi-language messages, backup/restore, premium feature flags, Web Dashboard, AI FAQ, translation, and scheduled analytics reports.

## Security notes

Never commit `.env` or a real bot token. The bot should be granted only the Telegram administrator permissions required for the enabled modules. MongoDB should use authentication and network restrictions in production. All destructive moderation actions should remain auditable through `ModLog`.
