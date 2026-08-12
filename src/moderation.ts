import { Group, User, ModLog } from './models';
import { formatText } from './utils/ui';
import { isOwner } from './services/access';
import { Markup } from 'telegraf';

const settingMap: Record<string, string> = {
  regulation: 'settings.regulation', antispam: 'settings.antispam', antiflood: 'settings.antiFlood',
  goodbye: 'settings.goodbye', alphabets: 'settings.alphabets', captcha: 'settings.captcha',
  checks: 'settings.checks', admin: 'settings.admin', blocks: 'settings.blocks', media: 'settings.media',
  porn: 'settings.porn', warns: 'settings.warns', night: 'settings.night', tag: 'settings.tag',
  link: 'settings.linkFilter', guardian: 'settings.guardian', approval: 'settings.approval',
  delete: 'settings.autoDeleteCommands', other: 'settings.other', lang: 'settings.language'
};

const protectedStatuses = new Set(['creator', 'administrator']);
const linkRe = /(https?:\/\/|www\.|t\.me\/|telegram\.me\/|@[a-zA-Z0-9_]{4,})/i;
const flood = new Map<string, number[]>();
const warned = new Map<string, number>();
const captchaAnswers = new Map<string, number>();
function isNight(s: any): boolean { const hour = new Date().getUTCHours(); const start = Number(s.nightStart ?? 22); const end = Number(s.nightEnd ?? 7); return start > end ? hour >= start || hour < end : hour >= start && hour < end; }

async function isAdmin(ctx: any, chatId: number, userId: number): Promise<boolean> {
  if (isOwner(userId)) return true;
  try { return protectedStatuses.has((await ctx.telegram.getChatMember(chatId, userId)).status); } catch { return false; }
}
async function strike(ctx: any, chatId: number, userId: number, reason: string, messageId: number): Promise<void> {
  const key = `${chatId}:${userId}`;
  const count = (warned.get(key) || 0) + 1; warned.set(key, count);
  await User.updateOne({ userId }, { $inc: { warnings: 1 }, $set: { firstName: ctx.from?.first_name || 'Member', username: ctx.from?.username } }, { upsert: true });
  await ModLog.create({ chatId, actorId: 0, targetId: userId, action: 'warning', reason });
  try { await ctx.telegram.deleteMessage(chatId, messageId); } catch {}
  if (count >= 3) {
    try { await ctx.telegram.restrictChatMember(chatId, userId, { permissions: { can_send_messages: false }, until_date: Math.floor(Date.now() / 1000) + 3600 }); } catch {}
    warned.delete(key);
    await ctx.telegram.sendMessage(chatId, `⚠️ Member restricted for repeated violations (3 warnings).`).catch(() => undefined);
  }
}
function mediaKind(message: any): string | undefined {
  if (message.photo) return 'photo'; if (message.video) return 'video'; if (message.voice) return 'voice';
  if (message.sticker) return 'sticker'; if (message.animation) return 'gif'; if (message.document) return 'document';
  return undefined;
}

export function installModerationHandlers(bot: any): void {
  bot.action(/^set:(regulation|antispam|antiflood|goodbye|alphabets|captcha|checks|admin|blocks|media|porn|warns|night|tag|link|guardian|approval|delete|other|lang):(-?\d+)$/, async (ctx: any) => {
    if (!isOwner(ctx.from.id)) return ctx.answerCbQuery('Owner only');
    const key = ctx.match[1]; const chatId = Number(ctx.match[2]); const path = settingMap[key];
    const group = await Group.findOne({ chatId }); if (!group || !path) return ctx.answerCbQuery('Group not found');
    if (key === 'lang') {
      const languages = ['my', 'en', 'both']; const current = String(group.get(path) || 'my'); const next = languages[(languages.indexOf(current) + 1) % languages.length];
      await Group.updateOne({ chatId }, { $set: { [path]: next } }); await ModLog.create({ chatId, actorId: ctx.from.id, action: 'setting_lang', metadata: { language: next } });
      await ctx.answerCbQuery(`Language: ${next}`); return ctx.editMessageText(`✅ Bot language is now ${next.toUpperCase()}`, Markup.inlineKeyboard([[Markup.button.callback('⚙ Settings', `group:settings:${chatId}`)]]));
    }
    const current = Boolean(group.get(path)); const next = !current;
    await Group.updateOne({ chatId }, { $set: { [path]: next } });
    await ModLog.create({ chatId, actorId: ctx.from.id, action: `setting_${key}`, metadata: { enabled: next } });
    await ctx.answerCbQuery(`${key}: ${next ? 'ON' : 'OFF'}`);
    const rows = [[Markup.button.callback('⚙ Settings', `group:settings:${chatId}`)], [Markup.button.callback('🔙 Group menu', `group:home:${chatId}`)]];
    return ctx.editMessageText(`✅ ${key.toUpperCase()} is now ${next ? '🟢 ENABLED' : '🔴 DISABLED'}\n\nEnforcement is active immediately for this group.`, Markup.inlineKeyboard(rows));
  });

  bot.on('new_chat_members', async (ctx: any) => {
    const chatId = ctx.chat?.id; const group = chatId ? await Group.findOne({ chatId }) : null; if (!group?.approved || !group.settings?.captcha) return;
    for (const member of ctx.message.new_chat_members || []) {
      const answer = Math.floor(Math.random() * 8) + 2; captchaAnswers.set(`${chatId}:${member.id}`, answer);
      try { await ctx.telegram.restrictChatMember(chatId, member.id, { permissions: { can_send_messages: false }, until_date: Math.floor(Date.now() / 1000) + Number(group.settings.verificationTimeout || 120) }); } catch {}
      await ctx.telegram.sendMessage(chatId, `🧠 Verification required for ${member.first_name || 'new member'}\nTap the correct answer to unlock:`, Markup.inlineKeyboard([[Markup.button.callback(`✅ ${answer}`, `captcha:pass:${chatId}:${member.id}:${answer}`)]]));
    }
  });
  bot.action(/^captcha:pass:(-?\d+):(\d+):(\d+)$/, async (ctx: any) => {
    const chatId = Number(ctx.match[1]); const userId = Number(ctx.match[2]); const answer = Number(ctx.match[3]);
    if (ctx.from.id !== userId || captchaAnswers.get(`${chatId}:${userId}`) !== answer) return ctx.answerCbQuery('This verification is not yours');
    await ctx.telegram.restrictChatMember(chatId, userId, { permissions: { can_send_messages: true, can_send_audios: true, can_send_documents: true, can_send_photos: true, can_send_videos: true, can_send_video_notes: true, can_send_voice_notes: true, can_send_polls: true, can_send_other_messages: true, can_add_web_page_previews: true, can_change_info: false, can_invite_users: true, can_pin_messages: false } });
    captchaAnswers.delete(`${chatId}:${userId}`); await ctx.answerCbQuery('Verified'); await ctx.editMessageText(`✅ ${ctx.from.first_name} verified successfully.`).catch(() => undefined);
  });

  bot.on('chat_join_request', async (ctx: any) => {
    const chatId = ctx.chat?.id; const user = ctx.from; if (!chatId || !user) return;
    const group = await Group.findOne({ chatId }); if (!group?.approved || !group.settings?.approval) return;
    const admins = await ctx.telegram.getChatAdministrators(chatId).catch(() => []);
    await Promise.all(admins.filter((a: any) => !a.user.is_bot).map((a: any) => ctx.telegram.sendMessage(a.user.id, `📬 Join request\n${user.first_name || user.username || user.id} wants to join ${ctx.chat.title || chatId}.`, Markup.inlineKeyboard([[Markup.button.callback('✅ Approve', `join:approve:${chatId}:${user.id}`), Markup.button.callback('❌ Decline', `join:decline:${chatId}:${user.id}`)]])).catch(() => undefined)));
  });
  bot.action(/^join:(approve|decline):(-?\d+):(\d+)$/, async (ctx: any) => {
    const action = ctx.match[1]; const chatId = Number(ctx.match[2]); const userId = Number(ctx.match[3]);
    if (!isOwner(ctx.from.id) && !(await isAdmin(ctx, chatId, ctx.from.id))) return ctx.answerCbQuery('Admin only');
    if (action === 'approve') await ctx.telegram.approveChatJoinRequest(chatId, userId); else await ctx.telegram.declineChatJoinRequest(chatId, userId);
    await ctx.answerCbQuery(action === 'approve' ? 'Approved' : 'Declined'); await ctx.editMessageText(`📬 Join request ${action}d for user ${userId}.`).catch(() => undefined);
  });

  bot.on('left_chat_member', async (ctx: any) => {
    const chatId = ctx.chat?.id; const member = ctx.message?.left_chat_member; if (!chatId || !member) return;
    const group = await Group.findOne({ chatId }); if (!group?.approved || !group.settings?.goodbye) return;
    const text = formatText(String(group.settings.goodbyeText || '👋 Goodbye {mention}'), { user: member, chatTitle: ctx.chat.title });
    await ctx.reply(text, { parse_mode: 'Markdown' }).catch(() => undefined);
    await Group.updateOne({ chatId }, { $inc: { 'stats.leaves': 1 } });
  });

  bot.on('message', async (ctx: any, next: any) => {
    const chatId = ctx.chat?.id; const from = ctx.from; const message = ctx.message;
    if (!chatId || !from || ctx.chat.type === 'private' || !message || (await isAdmin(ctx, chatId, from.id))) return next();
    const group = await Group.findOne({ chatId }); if (!group?.approved) return next();
    const s: any = group.settings || {}; const text = String(message.text || message.caption || '');
    if (s.autoDeleteCommands && text.startsWith('/')) { await ctx.deleteMessage().catch(() => undefined); return; }
    if (s.night && isNight(s)) { await ctx.deleteMessage().catch(() => undefined); return; }
    if (s.guardian && (from.is_bot || !from.username) && !text && mediaKind(message)) return strike(ctx, chatId, from.id, 'guardian_profile_check', message.message_id);
    if (s.linkFilter && linkRe.test(text)) return strike(ctx, chatId, from.id, 'link_filter', message.message_id);
    if (s.tag && /(^|\s)@(all|everyone|here)\b/i.test(text)) return strike(ctx, chatId, from.id, 'mass_tag', message.message_id);
    if (s.blocks && Array.isArray(s.badWords) && s.badWords.some((w: string) => w && text.toLowerCase().includes(w.toLowerCase()))) return strike(ctx, chatId, from.id, 'blocked_word', message.message_id);
    if (s.alphabets && /[\u0400-\u04ff\u0600-\u06ff\u0900-\u097f]/.test(text)) return strike(ctx, chatId, from.id, 'blocked_alphabet', message.message_id);
    if (s.antispam && /(buy now|free money|crypto giveaway|join my channel|viagra)/i.test(text)) return strike(ctx, chatId, from.id, 'anti_spam', message.message_id);
    if (s.media) { const kind = mediaKind(message); const allowed = Array.isArray(s.allowedMedia) ? s.allowedMedia : []; if (kind && allowed.length && !allowed.includes(kind)) return strike(ctx, chatId, from.id, `media_${kind}`, message.message_id); }
    if (s.porn && /(porn|xxx|onlyfans|nude|sex video)/i.test(text)) return strike(ctx, chatId, from.id, 'adult_content', message.message_id);
    if (s.antiFlood) { const key = `${chatId}:${from.id}`; const now = Date.now(); const values = (flood.get(key) || []).filter(t => now - t < 10000); values.push(now); flood.set(key, values); if (values.length > Number(s.floodLimit || 5)) { flood.set(key, []); try { await ctx.telegram.restrictChatMember(chatId, from.id, { permissions: { can_send_messages: false }, until_date: Math.floor(now / 1000) + 60 }); } catch {} return ctx.deleteMessage().catch(() => undefined); } }
    if (s.admin && /(^|\s)@admin\b/i.test(text)) { const admins = await ctx.telegram.getChatAdministrators(chatId).catch(() => []); await Promise.all(admins.filter((a: any) => !a.user.is_bot).map((a: any) => ctx.telegram.sendMessage(a.user.id, `🆘 @admin alert in ${ctx.chat.title || chatId}\nFrom: ${from.first_name}\n${text}`).catch(() => undefined))); }
    return next();
  });
}

export async function verifyJoinRequest(ctx: any): Promise<void> {
  const chatId = ctx.chat?.id; const user = ctx.from; if (!chatId || !user) return;
  const group = await Group.findOne({ chatId }); if (!group?.approved || !group.settings?.approval) return;
  try { await ctx.telegram.declineChatJoinRequest(chatId, user.id); } catch {}
}
