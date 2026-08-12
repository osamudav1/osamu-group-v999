# OSAMU GROUP V999

Premium blue-style Telegram Group Help & Moderation Bot powered by **Node.js, TypeScript, Telegraf, and MongoDB**.

## Core behavior

This bot uses an owner-first approval model. A group must send `/request_access`, and only an account listed in `OWNER_IDS` can approve it. Until approval, group features are blocked. After approval, the owner can grant individual permissions to admins instead of giving every admin full control.

The current foundation includes owner approval, owner panel, granular moderation permissions, reply-based ban/mute/warn/unban/purge, welcome messages, verification buttons, link filtering, mod logs, analytics, MongoDB persistence, nested inline-button menus, and a blue premium visual style.

## Setup

1. Create a bot with BotFather and keep the token private.
2. Copy `.env.example` to `.env`.
3. Set `BOT_TOKEN`, `MONGODB_URI`, and comma-separated numeric `OWNER_IDS`.
4. Add the bot to a group and grant the administrator permissions it needs to delete messages, restrict members, and ban members.
5. Run `npm install`, then `npm run build`, then `npm start`.

For development, use `npm run dev`.

## Supported commands

| Command | Purpose |
|---|---|
| `/start` | Open the blue help center |
| `/request_access` | Ask the owner to approve this group |
| `/setup` | Owner approves and activates the current group |
| `/panel` | Owner-only private control panel |
| `/help` | Open the command center |
| `/warn` | Reply to a member message and warn |
| `/mute` | Reply to a member message and mute |
| `/unmute` | Reply to a member message and unmute |
| `/ban` | Reply to a member message and ban |
| `/unban` | Reply to a member message and unban |
| `/purge` | Reply to a message and delete it |
| `/setwelcome <text>` | Set the welcome template |
| `/stats` | Show group activity statistics |

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

Permissions are stored per group and per admin in MongoDB. Available permission keys are `manage_settings`, `moderate`, `filters`, `welcome`, `broadcast`, `tickets`, `analytics`, `custom_commands`, `points`, and `logs`. Owner IDs always bypass permission checks; normal admins do not.

## Planned expansion modules

The architecture is ready for anti-flood, anti-raid, bad-word filters, whitelist/blacklist, slow mode, lock modes, scheduled announcements, custom commands, tickets, reports, points, levels, badges, leaderboard, admin notes, multi-language messages, backup/restore, premium feature flags, Web Dashboard, AI FAQ, translation, and scheduled analytics reports.

## Security notes

Never commit `.env` or a real bot token. The bot should be granted only the Telegram administrator permissions required for the enabled modules. MongoDB should use authentication and network restrictions in production. All destructive moderation actions should remain auditable through `ModLog`.
