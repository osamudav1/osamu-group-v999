import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

export function mention(user: { id: number; first_name?: string; username?: string }): string {
  const label = user.first_name || user.username || 'Member';
  return `[${label}](tg://user?id=${user.id})`;
}

export function formatText(template: string, ctx: { user?: { id: number; first_name?: string; username?: string }; chatTitle?: string; username?: string; count?: number }): string {
  const u = ctx.user;
  return template.replaceAll('{mention}', u ? mention(u) : '').replaceAll('{first_name}', u?.first_name || '').replaceAll('{username}', u?.username ? `@${u.username}` : '').replaceAll('{user_id}', String(u?.id || '')).replaceAll('{chat_title}', ctx.chatTitle || '').replaceAll('{count}', String(ctx.count ?? ''));
}

export function mainKeyboard(): InlineKeyboardMarkup {
  return { inline_keyboard: [[{ text: '🛡 Moderation', callback_data: 'menu:moderation' }, { text: '👋 Welcome', callback_data: 'menu:welcome' }], [{ text: '🚨 Security', callback_data: 'menu:security' }, { text: '👥 Members', callback_data: 'menu:members' }], [{ text: '🏆 Points', callback_data: 'menu:points' }, { text: '📊 Analytics', callback_data: 'menu:analytics' }], [{ text: '🎫 Tickets', callback_data: 'menu:tickets' }, { text: '⚙ Settings', callback_data: 'menu:settings' }], [{ text: '📖 Help', callback_data: 'menu:help' }, { text: '🔙 Close', callback_data: 'ui:close' }]] };
}

export function backKeyboard(to = 'menu:main'): InlineKeyboardMarkup { return { inline_keyboard: [[{ text: '🔙 Back', callback_data: to }]] }; }
export function confirmKeyboard(yes: string, no = 'ui:close'): InlineKeyboardMarkup { return { inline_keyboard: [[{ text: '✅ Confirm', callback_data: yes }, { text: '❌ Cancel', callback_data: no }]] }; }
