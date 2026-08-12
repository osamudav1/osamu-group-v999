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
const token = process.env.BOT_TOKEN;
const mongoUri = process.env.MONGODB_URI;
const port = Number(process.env.PORT || 10000);
if (!token || !mongoUri)
    throw new Error('BOT_TOKEN and MONGODB_URI are required');
const bot = new telegraf_1.Telegraf(token);
const ownerPanel = () => telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('🗂 Groups', 'owner:groups'), telegraf_1.Markup.button.callback('📊 Overview', 'owner:overview')], [telegraf_1.Markup.button.callback('🛡 Moderation', 'owner:moderation'), telegraf_1.Markup.button.callback('👮 Permissions', 'owner:permissions')], [telegraf_1.Markup.button.callback('👋 Welcome', 'owner:welcome'), telegraf_1.Markup.button.callback('🚨 Security', 'owner:security')], [telegraf_1.Markup.button.callback('📢 Broadcast', 'owner:broadcast'), telegraf_1.Markup.button.callback('⚙ Global Settings', 'owner:settings')]]);
const groupPanel = (chatId) => telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('🛡 Moderation', `group:moderation:${chatId}`), telegraf_1.Markup.button.callback('👋 Welcome', `group:welcome:${chatId}`)], [telegraf_1.Markup.button.callback('🚨 Security', `group:security:${chatId}`), telegraf_1.Markup.button.callback('👮 Admins', `group:admins:${chatId}`)], [telegraf_1.Markup.button.callback('🏆 Points', `group:points:${chatId}`), telegraf_1.Markup.button.callback('📊 Analytics', `group:analytics:${chatId}`)], [telegraf_1.Markup.button.callback('✅ Approve', `group:approve:${chatId}`), telegraf_1.Markup.button.callback('🔴 Disable', `group:disable:${chatId}`)], [telegraf_1.Markup.button.callback('🔙 Owner menu', 'owner:home')]]);
const togglePanel = (chatId) => telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('🔗 Link Filter', `toggle:link:${chatId}`), telegraf_1.Markup.button.callback('🌊 Anti-Flood', `toggle:flood:${chatId}`)], [telegraf_1.Markup.button.callback('🤖 Verification', `toggle:verify:${chatId}`), telegraf_1.Markup.button.callback('🧹 Auto Delete', `toggle:autodelete:${chatId}`)], [telegraf_1.Markup.button.callback('🚨 Anti-Raid', `toggle:raid:${chatId}`)], [telegraf_1.Markup.button.callback('🔙 Group menu', `group:home:${chatId}`)]]);
const welcomePanel = (chatId) => telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('💙 Blue Welcome', `welcome:blue:${chatId}`), telegraf_1.Markup.button.callback('✨ Premium Welcome', `welcome:premium:${chatId}`)], [telegraf_1.Markup.button.callback('🧾 Format Help', `welcome:format:${chatId}`), telegraf_1.Markup.button.callback('🖼️ Save Photo', `welcome:photo:${chatId}`)], [telegraf_1.Markup.button.callback('🔘 Verification Button', `welcome:verify:${chatId}`)], [telegraf_1.Markup.button.callback('🔙 Group menu', `group:home:${chatId}`)]]);
const permissions = ['manage_settings', 'moderate', 'filters', 'welcome', 'broadcast', 'tickets', 'analytics', 'custom_commands', 'points', 'logs'];
async function log(chatId, actorId, action, targetId) { await models_1.ModLog.create({ chatId, actorId, targetId, action }); await models_1.Group.updateOne({ chatId }, { $inc: { 'stats.actions': 1 } }); }
async function showOwner(ctx, text = '👑 *OSAMU GROUP V999 OWNER CENTER*\n💙 Button-only control panel') { if (!(0, access_1.isOwner)(ctx.from?.id))
    return ctx.reply('⛔ Owner access only'); await ctx.replyWithMarkdown(text, ownerPanel()); }
bot.on('my_chat_member', async (ctx) => { const chat = ctx.chat; if (chat.type !== 'group' && chat.type !== 'supergroup')
    return; await (0, access_1.ensureGroup)(ctx); for (const ownerId of access_1.ownerIds)
    await ctx.telegram.sendMessage(ownerId, `🔔 New group access request\n💙 ${chat.title || chat.id}`, telegraf_1.Markup.inlineKeyboard([[telegraf_1.Markup.button.callback('✅ Approve', `owner:approve:${chat.id}`), telegraf_1.Markup.button.callback('❌ Reject', `owner:reject:${chat.id}`)]])); });
bot.on('message', async (ctx) => { if (ctx.chat?.type === 'private') {
    if ((0, access_1.isOwner)(ctx.from?.id))
        return showOwner(ctx);
    return ctx.reply('💙 Owner approval လိုအပ်ပါသည်။');
} if (!(await (0, access_1.requireApproved)(ctx)))
    return; });
bot.action('owner:home', async (ctx) => { await ctx.answerCbQuery(); await ctx.editMessageText('👑 *OSAMU GROUP V999 OWNER CENTER*\n💙 Button-only control panel', { parse_mode: 'Markdown', ...ownerPanel() }); });
bot.action('owner:groups', async (ctx) => { if (!(0, access_1.isOwner)(ctx.from.id))
    return ctx.answerCbQuery('Owner only'); const groups = await models_1.Group.find({}).sort({ updatedAt: -1 }).limit(30); const rows = groups.length ? groups.map(g => [telegraf_1.Markup.button.callback(`${g.approved ? '🟢' : '🔴'} ${g.title || g.chatId}`, `owner:group:${g.chatId}`)]) : [[telegraf_1.Markup.button.callback('No groups yet', 'ui:close')]]; await ctx.editMessageText('🗂 *MANAGED GROUPS*\nSelect a group', { parse_mode: 'Markdown', ...telegraf_1.Markup.inlineKeyboard([...rows, [telegraf_1.Markup.button.callback('🔙 Back', 'owner:home')]]) }); await ctx.answerCbQuery(); });
bot.action(/^owner:group:(-?\d+)$/, async (ctx) => { if (!(0, access_1.isOwner)(ctx.from.id))
    return ctx.answerCbQuery('Owner only'); const chatId = Number(ctx.match[1]); const g = await models_1.Group.findOne({ chatId }); await ctx.editMessageText(`💙 *GROUP CONTROL*\n${g?.title || chatId}\nStatus: ${g?.approved ? '🟢 Approved' : '🔴 Pending'}`, { parse_mode: 'Markdown', ...groupPanel(chatId) }); await ctx.answerCbQuery(); });
bot.action(/^owner:(approve|reject):(-?\d+)$/, async (ctx) => { if (!(0, access_1.isOwner)(ctx.from.id))
    return ctx.answerCbQuery('Owner only'); const approved = ctx.match[1] === 'approve'; const chatId = Number(ctx.match[2]); await models_1.Group.updateOne({ chatId }, { $set: { approved, approvedBy: ctx.from.id, approvedAt: new Date() } }, { upsert: true }); await ctx.editMessageText(approved ? '✅ Group approved and activated.' : '❌ Group rejected.'); await ctx.answerCbQuery(approved ? 'Approved' : 'Rejected'); });
bot.action(/^group:(home|moderation|welcome|security|admins|points|analytics|approve|disable):(-?\d+)$/, async (ctx) => {
    if (!(0, access_1.isOwner)(ctx.from.id))
        return ctx.answerCbQuery('Owner only');
    const mode = ctx.match[1];
    const chatId = Number(ctx.match[2]);
    if (mode === 'approve' || mode === 'disable') {
        await models_1.Group.updateOne({ chatId }, { $set: { approved: mode === 'approve', approvedBy: ctx.from.id } }, { upsert: true });
        await ctx.answerCbQuery(mode === 'approve' ? 'Approved' : 'Disabled');
    }
    if (mode === 'home') {
        const g = await models_1.Group.findOne({ chatId });
        await ctx.editMessageText(`💙 *GROUP CONTROL*\n${g?.title || chatId}\nStatus: ${g?.approved ? '🟢 Approved' : '🔴 Pending'}`, { parse_mode: 'Markdown', ...groupPanel(chatId) });
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
bot.action(/^toggle:(link|flood|verify|autodelete|raid):(-?\d+)$/, async (ctx) => { if (!(0, access_1.isOwner)(ctx.from.id))
    return ctx.answerCbQuery('Owner only'); const key = ctx.match[1]; const chatId = Number(ctx.match[2]); const path = { link: 'settings.linkFilter', flood: 'settings.antiFlood', verify: 'settings.verification', autodelete: 'settings.autoDeleteCommands' }; if (key === 'raid')
    return ctx.answerCbQuery('Anti-raid module enabled for next release'); if (path[key]) {
    const g = await models_1.Group.findOne({ chatId });
    const current = Boolean(g?.get(path[key]));
    await models_1.Group.updateOne({ chatId }, { $set: { [path[key]]: !current } });
    await ctx.answerCbQuery(`${key}: ${!current ? 'ON' : 'OFF'}`);
} });
bot.action(/^welcome:(blue|premium|format|photo|verify):(-?\d+)$/, async (ctx) => { if (!(0, access_1.isOwner)(ctx.from.id))
    return ctx.answerCbQuery('Owner only'); const type = ctx.match[1]; const chatId = Number(ctx.match[2]); const templates = { blue: '💙 မင်္ဂလာပါ {mention}\n{chat_title} မှ ကြိုဆိုပါတယ်။\nစည်းကမ်းများကို လိုက်နာပေးပါ။', premium: '✨ Welcome {mention}\nYou are now part of {chat_title}.\nEnjoy the premium community 💙', format: '🧾 Variables: {mention} {first_name} {username} {user_id} {chat_title} {count}', photo: '🖼️ Photo upload state ready — send a photo now.', verify: '🔘 Verification button enabled.' }; if (type === 'blue' || type === 'premium')
    await models_1.Group.updateOne({ chatId }, { $set: { 'settings.welcomeText': templates[type] } }); await ctx.editMessageText(templates[type], { reply_markup: (0, ui_1.backKeyboard)(`group:welcome:${chatId}`) }); await ctx.answerCbQuery(); });
bot.action(/^mod:(lock|unlock|purge|slow):(-?\d+)$/, async (ctx) => { if (!(0, access_1.isOwner)(ctx.from.id))
    return ctx.answerCbQuery('Owner only'); await ctx.answerCbQuery(`${ctx.match[1]} queued`); });
bot.action(/^admins:(list|grant|revoke):(-?\d+)$/, async (ctx) => { if (!(0, access_1.isOwner)(ctx.from.id))
    return ctx.answerCbQuery('Owner only'); const chatId = Number(ctx.match[2]); if (ctx.match[1] === 'list') {
    const admins = await models_1.Admin.find({ chatId, active: true }).limit(20);
    await ctx.editMessageText(admins.length ? admins.map(a => `👮 ${a.displayName}: ${a.permissions.join(', ')}`).join('\n') : 'No custom admins yet.', { reply_markup: (0, ui_1.backKeyboard)(`group:admins:${chatId}`) });
}
else
    await ctx.answerCbQuery('Use the guided member picker in the next screen.'); });
bot.action(/^verify:(\d+)$/, async (ctx) => { if (ctx.from.id !== Number(ctx.match[1]))
    return ctx.answerCbQuery('Not your button'); await ctx.editMessageText(`✅ Verified — ${ctx.from.first_name} ကြိုဆိုပါတယ် 💙`); await ctx.answerCbQuery('Verified'); });
bot.action('ui:close', async (ctx) => { await ctx.deleteMessage().catch(() => undefined); await ctx.answerCbQuery(); });
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
