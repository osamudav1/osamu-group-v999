"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOwner = exports.ownerIds = void 0;
exports.ensureGroup = ensureGroup;
exports.isApproved = isApproved;
exports.hasPermission = hasPermission;
exports.requireApproved = requireApproved;
const models_1 = require("../models");
exports.ownerIds = new Set((process.env.OWNER_IDS || '').split(',').map(v => Number(v.trim())).filter(Boolean));
const isOwner = (userId) => Boolean(userId && exports.ownerIds.has(userId));
exports.isOwner = isOwner;
async function ensureGroup(ctx) {
    const chat = ctx.chat;
    if (!chat || (chat.type !== 'group' && chat.type !== 'supergroup'))
        return null;
    return models_1.Group.findOneAndUpdate({ chatId: chat.id }, { $setOnInsert: { chatId: chat.id, title: 'Telegram Group' } }, { upsert: true, new: true });
}
async function isApproved(chatId) {
    if (!chatId)
        return false;
    const group = await models_1.Group.findOne({ chatId });
    return Boolean(group?.approved);
}
async function hasPermission(chatId, userId, permission) {
    if ((0, exports.isOwner)(userId))
        return true;
    const admin = await models_1.Admin.findOne({ chatId, userId, active: true });
    return Boolean(admin && (admin.permissions.includes(permission) || admin.permissions.includes('manage_settings')));
}
async function requireApproved(ctx) {
    if (ctx.chat?.type === 'private')
        return true;
    const ok = await isApproved(ctx.chat?.id);
    if (!ok) {
        await ctx.reply('🔒 ဒီ group ကို Owner မှ approve မလုပ်ရသေးပါ။ Owner ကို `/request_access` ပို့ခိုင်းပါ။');
        return false;
    }
    return true;
}
