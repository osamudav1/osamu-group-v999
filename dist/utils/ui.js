"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mention = mention;
exports.formatText = formatText;
exports.mainKeyboard = mainKeyboard;
exports.backKeyboard = backKeyboard;
exports.confirmKeyboard = confirmKeyboard;
function mention(user) {
    const label = user.first_name || user.username || 'Member';
    return `[${label}](tg://user?id=${user.id})`;
}
function formatText(template, ctx) {
    const u = ctx.user;
    return template.replaceAll('{mention}', u ? mention(u) : '').replaceAll('{first_name}', u?.first_name || '').replaceAll('{username}', u?.username ? `@${u.username}` : '').replaceAll('{user_id}', String(u?.id || '')).replaceAll('{chat_title}', ctx.chatTitle || '').replaceAll('{count}', String(ctx.count ?? ''));
}
function mainKeyboard() {
    return { inline_keyboard: [[{ text: '🛡 Moderation', callback_data: 'menu:moderation' }, { text: '👋 Welcome', callback_data: 'menu:welcome' }], [{ text: '🚨 Security', callback_data: 'menu:security' }, { text: '👥 Members', callback_data: 'menu:members' }], [{ text: '🏆 Points', callback_data: 'menu:points' }, { text: '📊 Analytics', callback_data: 'menu:analytics' }], [{ text: '🎫 Tickets', callback_data: 'menu:tickets' }, { text: '⚙ Settings', callback_data: 'menu:settings' }], [{ text: '📖 Help', callback_data: 'menu:help' }, { text: '🔙 Close', callback_data: 'ui:close' }]] };
}
function backKeyboard(to = 'menu:main') { return { inline_keyboard: [[{ text: '🔙 Back', callback_data: to }]] }; }
function confirmKeyboard(yes, no = 'ui:close') { return { inline_keyboard: [[{ text: '✅ Confirm', callback_data: yes }, { text: '❌ Cancel', callback_data: no }]] }; }
