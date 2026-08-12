import { Context } from 'telegraf';
import { Admin, Group, Permission } from '../models';

export const ownerIds = new Set((process.env.OWNER_IDS || '').split(',').map(v => Number(v.trim())).filter(Boolean));
export const isOwner = (userId?: number): boolean => Boolean(userId && ownerIds.has(userId));

export async function ensureGroup(ctx: Context): Promise<any> {
  const chat = ctx.chat;
  if (!chat || (chat.type !== 'group' && chat.type !== 'supergroup')) return null;
  return Group.findOneAndUpdate({ chatId: chat.id }, { $setOnInsert: { chatId: chat.id, title: 'Telegram Group' } }, { upsert: true, new: true });
}

export async function isApproved(chatId?: number): Promise<boolean> {
  if (!chatId) return false;
  const group = await Group.findOne({ chatId });
  return Boolean(group?.approved);
}

export async function hasPermission(chatId: number, userId: number, permission: Permission): Promise<boolean> {
  if (isOwner(userId)) return true;
  const admin = await Admin.findOne({ chatId, userId, active: true });
  return Boolean(admin && (admin.permissions.includes(permission) || admin.permissions.includes('manage_settings')));
}

export async function requireApproved(ctx: Context): Promise<boolean> {
  if (ctx.chat?.type === 'private') return true;
  const ok = await isApproved(ctx.chat?.id);
  if (!ok) { await ctx.reply('🔒 ဒီ group ကို မ activate ရသေးပါ။ Group creator က `/approved` ပို့ပြီး approve လုပ်ပါ။'); return false; }
  return true;
}
