import mongoose, { Schema, Document, Model } from 'mongoose';

export type Permission = 'manage_settings' | 'moderate' | 'filters' | 'welcome' | 'broadcast' | 'tickets' | 'analytics' | 'custom_commands' | 'points' | 'logs';

export interface IGroup extends Document {
  chatId: number; title: string; approved: boolean; approvedBy?: number; approvedAt?: Date;
  settings: { welcome: boolean; welcomeText: string; welcomePhoto?: string; rules?: string; verification: boolean; verificationTimeout: number; antiFlood: boolean; floodLimit: number; linkFilter: boolean; badWords: string[]; autoDeleteCommands: boolean; logChatId?: number; blueTheme: boolean; language: 'my' | 'en' | 'both' };
  stats: { joins: number; leaves: number; warnings: number; actions: number };
}
export interface IAdmin extends Document { chatId: number; userId: number; displayName: string; permissions: Permission[]; grantedBy: number; active: boolean; }
export interface IUser extends Document { userId: number; username?: string; firstName: string; points: number; level: number; warnings: number; joinedAt: Date; mutedUntil?: Date; banned: boolean; }
export interface ILog extends Document { chatId: number; actorId: number; targetId?: number; action: string; reason?: string; metadata?: Record<string, unknown>; createdAt: Date; }

const GroupSchema = new Schema<IGroup>({
  chatId: { type: Number, unique: true, index: true, required: true }, title: { type: String, required: true },
  approved: { type: Boolean, default: false }, approvedBy: Number, approvedAt: Date,
  settings: { welcome: { type: Boolean, default: true }, welcomeText: { type: String, default: 'မင်္ဂလာပါ {mention} 💙\nကျွန်တော်တို့ group မှ ကြိုဆိုပါတယ်။' }, welcomePhoto: String, rules: String, verification: { type: Boolean, default: true }, verificationTimeout: { type: Number, default: 120 }, antiFlood: { type: Boolean, default: true }, floodLimit: { type: Number, default: 5 }, linkFilter: { type: Boolean, default: false }, badWords: { type: [String], default: [] }, autoDeleteCommands: { type: Boolean, default: false }, logChatId: Number, blueTheme: { type: Boolean, default: true }, language: { type: String, enum: ['my', 'en', 'both'], default: 'my' } },
  stats: { joins: { type: Number, default: 0 }, leaves: { type: Number, default: 0 }, warnings: { type: Number, default: 0 }, actions: { type: Number, default: 0 } }
}, { timestamps: true });
const AdminSchema = new Schema<IAdmin>({ chatId: { type: Number, index: true, required: true }, userId: { type: Number, required: true }, displayName: String, permissions: { type: [String], default: [] }, grantedBy: Number, active: { type: Boolean, default: true } }, { timestamps: true });
AdminSchema.index({ chatId: 1, userId: 1 }, { unique: true });
const UserSchema = new Schema<IUser>({ userId: { type: Number, unique: true, index: true }, username: String, firstName: String, points: { type: Number, default: 0 }, level: { type: Number, default: 1 }, warnings: { type: Number, default: 0 }, joinedAt: { type: Date, default: Date.now }, mutedUntil: Date, banned: { type: Boolean, default: false } });
const LogSchema = new Schema<ILog>({ chatId: { type: Number, index: true }, actorId: Number, targetId: Number, action: String, reason: String, metadata: Schema.Types.Mixed, createdAt: { type: Date, default: Date.now } });

export const Group: Model<IGroup> = mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema);
export const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const ModLog: Model<ILog> = mongoose.models.ModLog || mongoose.model<ILog>('ModLog', LogSchema);

export async function connectMongo(uri: string): Promise<void> { await mongoose.connect(uri); console.log('MongoDB connected'); }
