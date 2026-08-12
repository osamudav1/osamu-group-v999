"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_http_1 = __importDefault(require("node:http"));
const telegraf_1 = require("telegraf");
const models_1 = require("./models");
const access_1 = require("./services/access");
const ui_1 = require("./utils/ui");
const moderation_1 = require("./moderation");
const token = process.env.BOT_TOKEN;
const mongoUri = process.env.MONGODB_URI;
const port = Number(process.env.PORT || 10000);
if (!token || !mongoUri)
    throw new Error('BOT_TOKEN and MONGODB_URI are required');
const bot = new telegraf_1.Telegraf(token);
(0, moderation_1.installModerationHandlers)(bot);
const ownerPanel = () => telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('🗂 Groups', 'owner:groups'), telegraf_1.Markup.button.callback('📊 Overview', 'owner:overview')], [telegraf_1.Markup.button.callback('🛡 Moderation', 'owner:moderation'), telegraf_1.Markup.button.callback('👮 Permissions', 'owner:permissions')], [telegraf_1.Markup.button.callback('👋 Welcome', 'owner:welcome'), telegraf_1.Markup.button.callback('🚨 Security', 'owner:security')], [telegraf_1.Markup.button.callback('📢 Broadcast', 'owner:broadcast'), telegraf_1.Markup.button.callback('⚙ Global Settings', 'owner:settings')]]);
const groupPanel = (chatId) => telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('🛡 Moderation', `group:moderation:${chatId}`), telegraf_1.Markup.button.callback('👋 Welcome', `group:welcome:${chatId}`)], [telegraf_1.Markup.button.callback('🚨 Security', `group:security:${chatId}`), telegraf_1.Markup.button.callback('👮 Admins', `group:admins:${chatId}`)], [telegraf_1.Markup.button.callback('🏆 Points', `group:points:${chatId}`), telegraf_1.Markup.button.callback('📊 Analytics', `group:analytics:${chatId}`)], [telegraf_1.Markup.button.callback('✅ Approve', `group:approve:${chatId}`), telegraf_1.Markup.button.callback('🔴 Disable', `group:disable:${chatId}`)], [telegraf_1.Markup.button.callback('🔙 Owner menu', 'owner:home')]]);
const togglePanel = (chatId) => telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('🔗 Link Filter', `toggle:link:${chatId}`), telegraf_1.Markup.button.callback('🌊 Anti-Flood', `toggle:flood:${chatId}`)], [telegraf_1.Markup.button.callback('🤖 Verification', `toggle:verify:${chatId}`), telegraf_1.Markup.button.callback('🧹 Auto Delete', `toggle:autodelete:${chatId}`)], [telegraf_1.Markup.button.callback('🚨 Anti-Raid', `toggle:raid:${chatId}`)], [telegraf_1.Markup.button.callback('🔙 Group menu', `group:home:${chatId}`)]]);
const welcomePanel = (chatId) => telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('📄 Text ✅', `welcome:text:${chatId}`), telegraf_1.Markup.button.callback('👀 See', `welcome:see:${chatId}`)], [telegraf_1.Markup.button.callback('📸 Media ✅', `welcome:media:${chatId}`), telegraf_1.Markup.button.callback('👀 See', `welcome:mediasee:${chatId}`)], [telegraf_1.Markup.button.callback('🔤 URL Buttons ✅', `welcome:url:${chatId}`), telegraf_1.Markup.button.callback('👀 See', `welcome:urlsee:${chatId}`)], [telegraf_1.Markup.button.callback('🖼️ Media below text ❌', `welcome:below:${chatId}`)], [telegraf_1.Markup.button.callback('👀 Full preview', `welcome:preview:${chatId}`)], [telegraf_1.Markup.button.callback('🗂 Select a Topic 🆕', `welcome:topic:${chatId}`)], [telegraf_1.Markup.button.callback('🔙 Back', `group:home:${chatId}`)]]);
const settingsPanel = (chatId) => telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('📜 Regulation', `set:regulation:${chatId}`), telegraf_1.Markup.button.callback('📨 Anti-Spam', `set:antispam:${chatId}`)], [telegraf_1.Markup.button.callback('💬 Welcome', `group:welcome:${chatId}`), telegraf_1.Markup.button.callback('🌊 Anti-Flood', `set:antiflood:${chatId}`)], [telegraf_1.Markup.button.callback('👋 Goodbye', `set:goodbye:${chatId}`), telegraf_1.Markup.button.callback('🕉 Alphabets', `set:alphabets:${chatId}`)], [telegraf_1.Markup.button.callback('🧠 Captcha', `set:captcha:${chatId}`), telegraf_1.Markup.button.callback('🔦 Checks', `set:checks:${chatId}`)], [telegraf_1.Markup.button.callback('🆘 @Admin', `set:admin:${chatId}`), telegraf_1.Markup.button.callback('🔐 Blocks', `set:blocks:${chatId}`)], [telegraf_1.Markup.button.callback('📸 Media', `set:media:${chatId}`), telegraf_1.Markup.button.callback('🔞 Porn', `set:porn:${chatId}`)], [telegraf_1.Markup.button.callback('❗ Warns', `set:warns:${chatId}`), telegraf_1.Markup.button.callback('🌙 Night', `set:night:${chatId}`)], [telegraf_1.Markup.button.callback('🔔 Tag', `set:tag:${chatId}`), telegraf_1.Markup.button.callback('🔗 Link', `set:link:${chatId}`)], [telegraf_1.Markup.button.callback('🕵️ Guardian Bot 🆕', `set:guardian:${chatId}`)], [telegraf_1.Markup.button.callback('📬 Approval mode', `set:approval:${chatId}`)], [telegraf_1.Markup.button.callback('🗑 Deleting Messages', `set:delete:${chatId}`)], [telegraf_1.Markup.button.callback('🇬🇧 Lang', `set:lang:${chatId}`), telegraf_1.Markup.button.callback('✅ Close', 'ui:close'), telegraf_1.Markup.button.callback('▶️ Other', `set:other:${chatId}`)]]);
const permissions = ['manage_settings', 'moderate', 'filters', 'welcome', 'broadcast', 'tickets', 'analytics', 'custom_commands', 'points', 'logs'];
const pendingWelcomePhoto = new Map();
const pendingWelcomeText = new Map();
const pendingWelcomeUrl = new Map();
const callbackError = async (ctx, error) => { console.error('Callback error:', error); try {
    await ctx.answerCbQuery('လုပ်ဆောင်မှု မအောင်မြင်ပါ။ ပြန်စမ်းပါ။');
}
catch { } try {
    await ctx.reply('⚠️ ဒီ button action ကို လုပ်မရပါ။ Bot admin permission၊ MongoDB connection နဲ့ group state ကို စစ်ပါ။');
}
catch { } };
bot.use(async (ctx, next) => { try {
    await next();
}
catch (error) {
    await callbackError(ctx, error);
} });
async function log(chatId, actorId, action, targetId) { await models_1.ModLog.create({ chatId, actorId, targetId, action }); await models_1.Group.updateOne({ chatId }, { $inc: { 'stats.actions': 1 } }); }
async function showOwner(ctx, text = '👑 *OSAMU GROUP V999 OWNER CENTER*\n💙 Button-only control panel') { if (!(0, access_1.isOwner)(ctx.from?.id))
    return ctx.reply('⛔ Owner access only'); await ctx.replyWithMarkdown(text, ownerPanel()); }
bot.on('my_chat_member', async (ctx) => { const chat = ctx.chat; if (chat.type !== 'group' && chat.type !== 'supergroup')
    return; await (0, access_1.ensureGroup)(ctx); for (const ownerId of access_1.ownerIds)
    await ctx.telegram.sendMessage(ownerId, `🔔 New group access request\n💙 ${chat.title || chat.id}`, telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('✅ Approve', `owner:approve:${chat.id}`), telegraf_1.Markup.button.callback('❌ Reject', `owner:reject:${chat.id}`)]])); });
bot.command('settings', async (ctx) => { const chat = ctx.chat; if (chat.type !== 'group' && chat.type !== 'supergroup')
    return; if (!(await (0, access_1.requireApproved)(ctx)))
    return; const g = await models_1.Group.findOne({ chatId: chat.id }); await ctx.reply(`⚙️ SETTINGS\nGroup: ${g?.title || chat.title || chat.id}\n\nSelect one of the settings that you want to change.`, settingsPanel(chat.id)); });
bot.command('approved', async (ctx) => { const chat = ctx.chat; if (chat.type !== 'group' && chat.type !== 'supergroup')
    return ctx.reply('ဒီ button-only approval ကို group ထဲမှာပဲ အသုံးပြုပါ။'); const sender = await ctx.telegram.getChatMember(chat.id, ctx.from.id); if (sender.status !== 'creator')
    return ctx.reply('⛔ Group creator သာ `/approved` လုပ်နိုင်ပါတယ်။'); const group = await (0, access_1.ensureGroup)(ctx); await models_1.Group.updateOne({ chatId: chat.id }, { $set: { approved: true, approvedBy: ctx.from.id, approvedAt: new Date(), title: chat.title || group?.title || String(chat.id) } }, { upsert: true }); await log(chat.id, ctx.from.id, 'group_owner_approved'); await ctx.reply(`✅ ${chat.title || 'ဒီ group'} ကို group owner က approve လုပ်ပြီးပါပြီ။\n💙 Bot features အားလုံးကို အခုအသုံးပြုနိုင်ပါပြီ။`, { ...telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('🛡 Open controls', `owner:group:${chat.id}`)]]) }); });
bot.on('photo', async (ctx) => { if (!(0, access_1.isOwner)(ctx.from?.id))
    return; const chatId = pendingWelcomePhoto.get(ctx.from.id); if (!chatId)
    return; const photos = ctx.message.photo; const photo = photos[photos.length - 1]; await models_1.Group.updateOne({ chatId }, { $set: { 'settings.welcomePhoto': photo.file_id, 'settings.welcome': true } }); pendingWelcomePhoto.delete(ctx.from.id); await ctx.reply('✅ Welcome photo သိမ်းပြီးပါပြီ။', { reply_markup: (0, ui_1.backKeyboard)(`group:welcome:${chatId}`) }); });
bot.on('text', async (ctx) => { if (!(0, access_1.isOwner)(ctx.from?.id))
    return; const text = ctx.message.text; if (text.startsWith('/'))
    return; const textChatId = pendingWelcomeText.get(ctx.from.id); if (textChatId) {
    await models_1.Group.updateOne({ chatId: textChatId }, { $set: { 'settings.welcomeText': text, 'settings.welcome': true } });
    pendingWelcomeText.delete(ctx.from.id);
    return ctx.reply('✅ Welcome စာသားအသစ် သိမ်းပြီးပါပြီ။', { reply_markup: (0, ui_1.backKeyboard)(`group:welcome:${textChatId}`) });
} const urlChatId = pendingWelcomeUrl.get(ctx.from.id); if (urlChatId) {
    const parts = text.split('|').map(value => value.trim());
    const label = parts[0];
    const url = parts.slice(1).join('|');
    if (!label || !/^https?:\/\//i.test(url))
        return ctx.reply('⚠️ Format မှားနေပါတယ်။ Button Name | https://example.com ပုံစံနဲ့ ပြန်ပို့ပါ။');
    const group = await models_1.Group.findOne({ chatId: urlChatId });
    const buttons = Array.isArray(group?.settings?.welcomeButtons) ? [...group.settings.welcomeButtons] : [];
    buttons.push({ text: label.slice(0, 64), url });
    await models_1.Group.updateOne({ chatId: urlChatId }, { $set: { 'settings.welcomeUrlButtons': true, 'settings.welcomeButtons': buttons } });
    pendingWelcomeUrl.delete(ctx.from.id);
    return ctx.reply(`✅ URL button သိမ်းပြီးပါပြီ။\\n\\n${label}`, { reply_markup: (0, ui_1.backKeyboard)(`group:welcome:${urlChatId}`) });
} });
bot.on('new_chat_members', async (ctx) => { const chat = ctx.chat; if (chat.type !== 'group' && chat.type !== 'supergroup')
    return; const group = await models_1.Group.findOne({ chatId: chat.id }); if (!group?.approved || group.settings?.welcome === false)
    return; const members = ctx.message.new_chat_members || []; const total = Number(group.stats?.joins || 0) + members.length; await models_1.Group.updateOne({ chatId: chat.id }, { $inc: { 'stats.joins': members.length } }); const buttons = Array.isArray(group.settings?.welcomeButtons) ? group.settings.welcomeButtons.filter(button => button.text && /^https?:\/\//i.test(button.url)).map(button => [telegraf_1.Markup.button.url(button.text, button.url)]) : []; for (const member of members) {
    const welcomeText = (0, ui_1.formatText)(group.settings?.welcomeText || 'မင်္ဂလာပါ {mention} 💙\\n{chat_title} မှ ကြိုဆိုပါတယ်။', { user: { id: member.id, first_name: member.first_name, username: member.username }, chatTitle: chat.title, count: total });
    const replyMarkup = buttons.length ? telegraf_1.Markup.inlineKeyboard(buttons) : undefined;
    try {
        if (group.settings?.welcomePhoto)
            await ctx.replyWithPhoto(group.settings.welcomePhoto, { caption: welcomeText, ...replyMarkup });
        else
            await ctx.reply(welcomeText, replyMarkup);
    }
    catch (error) {
        console.error('Welcome delivery failed:', error);
        try {
            await ctx.reply(welcomeText);
        }
        catch (fallbackError) {
            console.error('Welcome text fallback failed:', fallbackError);
        }
    }
} });
bot.on('message', async (ctx) => { if (ctx.chat?.type === 'private') {
    if ((0, access_1.isOwner)(ctx.from?.id))
        return showOwner(ctx);
    return ctx.reply('💙 Owner approval လိုအပ်ပါသည်။');
} if (!(await (0, access_1.requireApproved)(ctx)))
    return; });
bot.action('owner:home', async (ctx) => { await ctx.answerCbQuery(); await ctx.editMessageText('👑 *OSAMU GROUP V999 OWNER CENTER*\n💙 Button-only control panel', { parse_mode: 'Markdown', ...ownerPanel() }); });
bot.action(/^owner:(overview|moderation|permissions|welcome|security|broadcast|settings)$/, async (ctx) => { if (!(0, access_1.isOwner)(ctx.from.id))
    return ctx.answerCbQuery('Owner only'); const mode = ctx.match[1]; const labels = { overview: '📊 Overview', moderation: '🛡 Moderation', permissions: '👮 Permissions', welcome: '👋 Welcome', security: '🚨 Security', broadcast: '📢 Broadcast', settings: '⚙ Global Settings' }; await ctx.answerCbQuery(); await ctx.editMessageText(`${labels[mode]}\n\n🗂 Select a group to manage this module.`, { ...telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('🗂 Choose group', 'owner:groups')], [telegraf_1.Markup.button.callback('🔙 Owner menu', 'owner:home')]]) }); });
bot.action('owner:groups', async (ctx) => { if (!(0, access_1.isOwner)(ctx.from.id))
    return ctx.answerCbQuery('Owner only'); const groups = await models_1.Group.find({}).sort({ updatedAt: -1 }).limit(30); const rows = groups.length ? groups.map(g => [telegraf_1.Markup.button.callback(`${g.approved ? '🟢' : '🔴'} ${g.title || g.chatId}`, `owner:group:${g.chatId}`)]) : [[telegraf_1.Markup.button.callback('No groups yet', 'ui:close')]]; await ctx.editMessageText('🗂 *MANAGED GROUPS*\nSelect a group', { parse_mode: 'Markdown', ...telegraf_1.Markup.inlineKeyboard([...rows, [telegraf_1.Markup.button.callback('🔙 Back', 'owner:home')]]) }); await ctx.answerCbQuery(); });
bot.action(/^owner:group:(-?\d+)$/, async (ctx) => { if (!(0, access_1.isOwner)(ctx.from.id))
    return ctx.answerCbQuery('Owner only'); const chatId = Number(ctx.match[1]); const g = await models_1.Group.findOne({ chatId }); await ctx.editMessageText(`💙 GROUP CONTROL\n${g?.title || chatId}\nStatus: ${g?.approved ? '🟢 Approved' : '🔴 Pending'}`, { ...groupPanel(chatId) }); await ctx.answerCbQuery('Opened'); });
bot.action(/^owner:(approve|reject):(-?\d+)$/, async (ctx) => { if (!(0, access_1.isOwner)(ctx.from.id))
    return ctx.answerCbQuery('Owner only'); const approved = ctx.match[1] === 'approve'; const chatId = Number(ctx.match[2]); await models_1.Group.updateOne({ chatId }, { $set: { approved, approvedBy: ctx.from.id, approvedAt: new Date() } }, { upsert: true }); await ctx.answerCbQuery(approved ? 'Approved' : 'Rejected'); await ctx.editMessageText(approved ? '✅ Group approved and activated.' : '❌ Group rejected.', { ...telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('🗂 Open groups', 'owner:groups'), telegraf_1.Markup.button.callback('🔙 Owner menu', 'owner:home')]]) }); });
bot.action(/^group:(home|settings|moderation|welcome|security|admins|points|analytics|approve|disable):(-?\d+)$/, async (ctx) => {
    if (!(0, access_1.isOwner)(ctx.from.id))
        return ctx.answerCbQuery('Owner only');
    const mode = ctx.match[1];
    const chatId = Number(ctx.match[2]);
    if (mode === 'approve' || mode === 'disable') {
        await models_1.Group.updateOne({ chatId }, { $set: { approved: mode === 'approve', approvedBy: ctx.from.id, approvedAt: new Date() } }, { upsert: true });
        await log(chatId, ctx.from.id, mode === 'approve' ? 'group_approved' : 'group_disabled');
        await ctx.answerCbQuery(mode === 'approve' ? 'Approved' : 'Disabled');
        const g = await models_1.Group.findOne({ chatId });
        return ctx.editMessageText(`💙 GROUP CONTROL\n${g?.title || chatId}\nStatus: ${g?.approved ? '🟢 Approved' : '🔴 Disabled'}`, { ...groupPanel(chatId) });
    }
    if (mode === 'home') {
        const g = await models_1.Group.findOne({ chatId });
        await ctx.editMessageText(`💙 GROUP CONTROL\n${g?.title || chatId}\nStatus: ${g?.approved ? '🟢 Approved' : '🔴 Pending'}`, { ...groupPanel(chatId) });
    }
    else if (mode === 'settings') {
        const g = await models_1.Group.findOne({ chatId });
        await ctx.editMessageText(`⚙️ SETTINGS\nGroup: ${g?.title || chatId}\n\nSelect one of the settings that you want to change.`, { ...settingsPanel(chatId) });
    }
    else if (mode === 'security')
        await ctx.editMessageText('🚨 *SECURITY CENTER*\nToggle protections below', { parse_mode: 'Markdown', ...togglePanel(chatId) });
    else if (mode === 'welcome')
        await ctx.editMessageText('👋 *WELCOME CENTER*\nChoose a blue welcome profile or format tool', { parse_mode: 'Markdown', ...welcomePanel(chatId) });
    else if (mode === 'moderation')
        await ctx.editMessageText('🛡 *MODERATION CENTER*\nUse the buttons to configure safe moderation', { parse_mode: 'Markdown', ...telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('🔒 Lock Group', `mod:lock:${chatId}`), telegraf_1.Markup.button.callback('🔓 Unlock Group', `mod:unlock:${chatId}`)], [telegraf_1.Markup.button.callback('🧹 Purge Mode', `mod:purge:${chatId}`), telegraf_1.Markup.button.callback('⚡ Slow Mode', `mod:slow:${chatId}`)], [telegraf_1.Markup.button.callback('🔙 Group menu', `group:home:${chatId}`)]]) });
    else if (mode === 'analytics') {
        const g = await models_1.Group.findOne({ chatId });
        await ctx.editMessageText(`📊 *ANALYTICS*\nJoins: ${g?.stats.joins || 0}\nWarnings: ${g?.stats.warnings || 0}\nActions: ${g?.stats.actions || 0}`, { parse_mode: 'Markdown', ...(0, ui_1.backKeyboard)(`group:home:${chatId}`) });
    }
    else if (mode === 'admins')
        await ctx.editMessageText('👮 *ADMIN PERMISSIONS*\nChoose an admin management action', { parse_mode: 'Markdown', ...telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('📋 List admins', `admins:list:${chatId}`), telegraf_1.Markup.button.callback('➕ Grant from reply', `admins:grant:${chatId}`)], [telegraf_1.Markup.button.callback('➖ Revoke from reply', `admins:revoke:${chatId}`)], [telegraf_1.Markup.button.callback('🔙 Group menu', `group:home:${chatId}`)]]) });
    else
        await ctx.editMessageText('🏆 *POINTS CENTER*\nPoints and levels module ready for configuration.', { parse_mode: 'Markdown', ...(0, ui_1.backKeyboard)(`group:home:${chatId}`) });
    await ctx.answerCbQuery();
});
bot.action(/^set:(regulation|antispam|antiflood|goodbye|alphabets|captcha|checks|admin|blocks|media|porn|warns|night|tag|link|guardian|approval|delete|lang|other):(-?\d+)$/, async (ctx) => { if (!(0, access_1.isOwner)(ctx.from.id))
    return ctx.answerCbQuery('Owner only'); const key = ctx.match[1]; const chatId = Number(ctx.match[2]); const field = `settings.${key}`; const current = Boolean((await models_1.Group.findOne({ chatId }))?.get(field)); await models_1.Group.updateOne({ chatId }, { $set: { [field]: !current } }, { upsert: true }); await log(chatId, ctx.from.id, `settings_${key}_${!current ? 'on' : 'off'}`); await ctx.answerCbQuery(`${key}: ${!current ? 'ON' : 'OFF'}`); const g = await models_1.Group.findOne({ chatId }); await ctx.editMessageText(`⚙️ SETTINGS\\nGroup: ${g?.title || chatId}\\n\\n${key} is now ${!current ? '🟢 ON' : '🔴 OFF'}\\n\\nSelect one of the settings that you want to change.`, { ...settingsPanel(chatId) }); });
bot.action(/^toggle:(link|flood|verify|autodelete|raid):(-?\d+)$/, async (ctx) => { if (!(0, access_1.isOwner)(ctx.from.id))
    return ctx.answerCbQuery('Owner only'); const key = ctx.match[1]; const chatId = Number(ctx.match[2]); const path = { link: 'settings.linkFilter', flood: 'settings.antiFlood', verify: 'settings.verification', autodelete: 'settings.autoDeleteCommands' }; if (key === 'raid') {
    await log(chatId, ctx.from.id, 'anti_raid_enabled');
    await ctx.answerCbQuery('Anti-raid ON');
    return ctx.editMessageText('🚨 Anti-raid protection is enabled.', { ...telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('🔙 Security', `group:security:${chatId}`)]]) });
} const field = path[key]; const g = await models_1.Group.findOne({ chatId }); if (!g || !field)
    return ctx.answerCbQuery('Group setting not found'); const current = Boolean(g.get(field)); await models_1.Group.updateOne({ chatId }, { $set: { [field]: !current } }); await log(chatId, ctx.from.id, `toggle_${key}`, undefined); await ctx.answerCbQuery(`${key}: ${!current ? 'ON' : 'OFF'}`); await ctx.editMessageText(`🚨 *SECURITY CENTER*\n${key} is now ${!current ? '🟢 ON' : '🔴 OFF'}`, { parse_mode: 'Markdown', ...togglePanel(chatId) }); });
bot.action(/^welcome:(blue|premium|format|photo|verify|text|see|media|mediasee|url|urlsee|below|preview|topic|topic_general|topic_announcements|topic_support):(-?\d+)$/, async (ctx) => { if (!(0, access_1.isOwner)(ctx.from.id))
    return ctx.answerCbQuery('Owner only'); const type = ctx.match[1]; const chatId = Number(ctx.match[2]); const back = { ...telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('🔙 Welcome menu', `group:welcome:${chatId}`)]]) }; if (type === 'photo' || type === 'media') {
    pendingWelcomePhoto.set(ctx.from.id, chatId);
    await ctx.answerCbQuery('Photo ပို့ပါ');
    return ctx.editMessageText('📸 ဒီ chat ထဲကို welcome photo ပို့ပါ။ ပို့ပြီးတာနဲ့ MongoDB မှာ သိမ်းပေးမယ်။', back);
} if (type === 'text') {
    pendingWelcomeText.set(ctx.from.id, chatId);
    await ctx.answerCbQuery('စာသားပို့ပါ');
    return ctx.editMessageText('📄 Welcome စာသားအသစ်ကို ဒီ chat ထဲ ပို့ပါ။\\n\\nရနိုင်သော format: {mention} {first_name} {username} {user_id} {chat_title} {count}', back);
} if (type === 'blue') {
    const text = '💙 မင်္ဂလာပါ {mention}\\n{chat_title} မှ ကြိုဆိုပါတယ်။\\nစည်းကမ်းများကို လိုက်နာပေးပါ။';
    await models_1.Group.updateOne({ chatId }, { $set: { 'settings.welcomeText': text, 'settings.welcome': true } });
    return ctx.editMessageText(`📄 Default text saved.\\n\\n${text}`, back);
} if (type === 'premium') {
    const text = '✨ Welcome {mention}\\nYou are now part of {chat_title}.\\nEnjoy the premium community 💙';
    await models_1.Group.updateOne({ chatId }, { $set: { 'settings.welcomeText': text, 'settings.welcome': true } });
    return ctx.editMessageText(`✨ Premium text saved.\\n\\n${text}`, back);
} if (type === 'format')
    return ctx.editMessageText('🧾 FORMAT VARIABLES\\n\\n{mention} {first_name} {username} {user_id} {chat_title} {count}', back); if (type === 'see' || type === 'mediasee' || type === 'urlsee') {
    const g = await models_1.Group.findOne({ chatId });
    const buttons = Array.isArray(g?.settings?.welcomeButtons) ? g.settings.welcomeButtons : [];
    const buttonText = buttons.length ? buttons.map(button => `🔗 ${button.text} — ${button.url}`).join('\\n') : 'မရှိသေးပါ';
    return ctx.editMessageText(`👀 PREVIEW\\n\\n${g?.settings?.welcomeText || 'Welcome text မသတ်မှတ်ရသေးပါ။'}\\n\\n📸 Media: ${g?.settings?.welcomePhoto ? '✅' : '❌'}\\n🔤 URL Buttons: ${buttons.length ? '✅' : '❌'}\\n${buttonText}`, back);
} if (type === 'url') {
    pendingWelcomeUrl.set(ctx.from.id, chatId);
    await ctx.answerCbQuery('Button format ပို့ပါ');
    return ctx.editMessageText('🔤 URL button အသစ်ထည့်ရန် ဒီ format နဲ့ပို့ပါ။\\n\\nButton Name | https://example.com', back);
} if (type === 'below') {
    const g = await models_1.Group.findOne({ chatId });
    const next = !Boolean(g?.settings?.mediaBelowText);
    await models_1.Group.updateOne({ chatId }, { $set: { 'settings.mediaBelowText': next } });
    return ctx.editMessageText(`🖼️ Media below text ${next ? '✅' : '❌'}`, back);
} if (type === 'preview') {
    const g = await models_1.Group.findOne({ chatId });
    const buttons = Array.isArray(g?.settings?.welcomeButtons) ? g.settings.welcomeButtons : [];
    const markup = buttons.length ? telegraf_1.Markup.inlineKeyboard(buttons.map(button => [telegraf_1.Markup.button.url(button.text, button.url)])) : back;
    if (g?.settings?.welcomePhoto)
        await ctx.replyWithPhoto(g.settings.welcomePhoto, { caption: g.settings.welcomeText || 'Welcome preview', ...markup });
    else
        await ctx.reply(g?.settings?.welcomeText || 'Welcome text မသတ်မှတ်ရသေးပါ။', markup);
    return ctx.answerCbQuery('Preview');
} if (type === 'topic' || type === 'topic_general' || type === 'topic_announcements' || type === 'topic_support') {
    if (type !== 'topic') {
        const topic = type.replace('topic_', '');
        await models_1.Group.updateOne({ chatId }, { $set: { 'settings.welcomeTopic': topic } });
        await ctx.answerCbQuery('Topic saved');
        return ctx.editMessageText(`✅ Welcome topic ကို ${topic} အဖြစ် သိမ်းပြီးပါပြီ။`, back);
    }
    return ctx.editMessageText('🗂 SELECT A TOPIC', { ...telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('General', `welcome:topic_general:${chatId}`)], [telegraf_1.Markup.button.callback('Announcements', `welcome:topic_announcements:${chatId}`)], [telegraf_1.Markup.button.callback('Support', `welcome:topic_support:${chatId}`)], [telegraf_1.Markup.button.callback('🔙 Back', `group:welcome:${chatId}`)]]) });
} if (type === 'verify') {
    await models_1.Group.updateOne({ chatId }, { $set: { 'settings.verification': true } });
    return ctx.editMessageText('✅ Verification button enabled.', back);
} await ctx.answerCbQuery('Done'); });
bot.action(/^mod:(lock|unlock|purge|slow):(-?\d+)$/, async (ctx) => { if (!(0, access_1.isOwner)(ctx.from.id))
    return ctx.answerCbQuery('Owner only'); const action = ctx.match[1]; const chatId = Number(ctx.match[2]); await log(chatId, ctx.from.id, `moderation_${action}`); await ctx.answerCbQuery(`${action} saved`); await ctx.editMessageText(`✅ ${action.toUpperCase()} setting saved for ${chatId}.`, { ...telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('🔙 Moderation', `group:moderation:${chatId}`), telegraf_1.Markup.button.callback('🏠 Group menu', `group:home:${chatId}`)]]) }); });
bot.action(/^admins:(list|grant|revoke):(-?\d+)$/, async (ctx) => { if (!(0, access_1.isOwner)(ctx.from.id))
    return ctx.answerCbQuery('Owner only'); const action = ctx.match[1]; const chatId = Number(ctx.match[2]); if (action === 'list') {
    const admins = await models_1.Admin.find({ chatId, active: true }).limit(20);
    const text = admins.length ? admins.map(a => `👮 ${a.displayName || a.userId}: ${a.permissions.join(', ')}`).join('\n') : 'No custom admins yet.';
    await ctx.editMessageText(text, { ...telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('➕ Grant', `admins:grant:${chatId}`), telegraf_1.Markup.button.callback('➖ Revoke', `admins:revoke:${chatId}`)], [telegraf_1.Markup.button.callback('🔙 Admin menu', `group:admins:${chatId}`)]]) });
    return ctx.answerCbQuery();
} const telegramAdmins = await ctx.telegram.getChatAdministrators(chatId); const buttons = telegramAdmins.filter(a => !a.user.is_bot && a.user.id !== ctx.from.id).map(a => [telegraf_1.Markup.button.callback(`${action === 'grant' ? '➕' : '➖'} ${a.user.first_name}`, `admins:user:${action}:${chatId}:${a.user.id}`)]); await ctx.answerCbQuery(); await ctx.editMessageText(`👮 Select a Telegram admin to ${action}.`, { ...telegraf_1.Markup.inlineKeyboard([...buttons, [telegraf_1.Markup.button.callback('🔙 Admin menu', `group:admins:${chatId}`)]]) }); });
bot.action(/^admins:user:(grant|revoke):(-?\d+):(\d+)$/, async (ctx) => { if (!(0, access_1.isOwner)(ctx.from.id))
    return ctx.answerCbQuery('Owner only'); const action = ctx.match[1]; const chatId = Number(ctx.match[2]); const userId = Number(ctx.match[3]); const member = await ctx.telegram.getChatMember(chatId, userId); const displayName = [member.user.first_name, member.user.last_name].filter(Boolean).join(' ') || member.user.username || String(userId); if (action === 'grant')
    await models_1.Admin.updateOne({ chatId, userId }, { $set: { displayName, permissions: ['moderate'], grantedBy: ctx.from.id, active: true } }, { upsert: true });
else
    await models_1.Admin.updateOne({ chatId, userId }, { $set: { active: false } }); await log(chatId, ctx.from.id, `admin_${action}`, userId); await ctx.answerCbQuery(`${action} complete`); await ctx.editMessageText(`✅ ${displayName} ${action === 'grant' ? 'ကို Moderator permission ပေးပြီးပါပြီ။' : 'ကို revoke လုပ်ပြီးပါပြီ။'}`, { ...telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('👮 Admin menu', `group:admins:${chatId}`), telegraf_1.Markup.button.callback('🏠 Group menu', `group:home:${chatId}`)]]) }); });
bot.action(/^verify:(\d+)$/, async (ctx) => { if (ctx.from.id !== Number(ctx.match[1]))
    return ctx.answerCbQuery('Not your button'); await ctx.editMessageText(`✅ Verified — ${ctx.from.first_name} ကြိုဆိုပါတယ် 💙`); await ctx.answerCbQuery('Verified'); });
bot.action('ui:close', async (ctx) => { await ctx.answerCbQuery('Closed'); await ctx.deleteMessage().catch(() => undefined); });
bot.on('callback_query', async (ctx) => { try {
    await ctx.answerCbQuery('ဒီ button action မရှိသေးပါ။');
}
catch { } });
bot.catch(err => console.error('Bot error:', err));
const healthServer = node_http_1.default.createServer((req, res) => { if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'osamu-group-v999', mode: 'button-only', timestamp: new Date().toISOString() }));
    return;
} res.writeHead(404, { 'content-type': 'application/json' }); res.end(JSON.stringify({ ok: false, error: 'not_found' })); });
healthServer.listen(port, '0.0.0.0', () => console.log(`Health server listening on ${port}`));
(async () => { await (0, models_1.connectMongo)(mongoUri); await bot.launch(); console.log('OSAMU GROUP V999 button-only started'); })().catch(err => { console.error('Startup failed:', err); process.exit(1); });
const shutdown = (signal) => { healthServer.close(); try {
    bot.stop(signal);
}
catch (error) {
    console.warn('Bot shutdown notice:', error.message);
} };
process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
