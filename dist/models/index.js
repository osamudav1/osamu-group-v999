"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModLog = exports.User = exports.Admin = exports.Group = void 0;
exports.connectMongo = connectMongo;
const mongoose_1 = __importStar(require("mongoose"));
const GroupSchema = new mongoose_1.Schema({
    chatId: { type: Number, unique: true, index: true, required: true }, title: { type: String, required: true },
    approved: { type: Boolean, default: false }, approvedBy: Number, approvedAt: Date,
    settings: { welcome: { type: Boolean, default: true }, welcomeText: { type: String, default: 'မင်္ဂလာပါ {mention} 💙\nကျွန်တော်တို့ group မှ ကြိုဆိုပါတယ်။' }, welcomePhoto: String, welcomeUrlButtons: { type: Boolean, default: false }, mediaBelowText: { type: Boolean, default: false }, rules: String, verification: { type: Boolean, default: true }, verificationTimeout: { type: Number, default: 120 }, antiFlood: { type: Boolean, default: true }, floodLimit: { type: Number, default: 5 }, linkFilter: { type: Boolean, default: false }, badWords: { type: [String], default: [] }, autoDeleteCommands: { type: Boolean, default: false }, logChatId: Number, blueTheme: { type: Boolean, default: true }, language: { type: String, enum: ['my', 'en', 'both'], default: 'my' } },
    stats: { joins: { type: Number, default: 0 }, leaves: { type: Number, default: 0 }, warnings: { type: Number, default: 0 }, actions: { type: Number, default: 0 } }
}, { timestamps: true });
const AdminSchema = new mongoose_1.Schema({ chatId: { type: Number, index: true, required: true }, userId: { type: Number, required: true }, displayName: String, permissions: { type: [String], default: [] }, grantedBy: Number, active: { type: Boolean, default: true } }, { timestamps: true });
AdminSchema.index({ chatId: 1, userId: 1 }, { unique: true });
const UserSchema = new mongoose_1.Schema({ userId: { type: Number, unique: true, index: true }, username: String, firstName: String, points: { type: Number, default: 0 }, level: { type: Number, default: 1 }, warnings: { type: Number, default: 0 }, joinedAt: { type: Date, default: Date.now }, mutedUntil: Date, banned: { type: Boolean, default: false } });
const LogSchema = new mongoose_1.Schema({ chatId: { type: Number, index: true }, actorId: Number, targetId: Number, action: String, reason: String, metadata: mongoose_1.Schema.Types.Mixed, createdAt: { type: Date, default: Date.now } });
exports.Group = mongoose_1.default.models.Group || mongoose_1.default.model('Group', GroupSchema);
exports.Admin = mongoose_1.default.models.Admin || mongoose_1.default.model('Admin', AdminSchema);
exports.User = mongoose_1.default.models.User || mongoose_1.default.model('User', UserSchema);
exports.ModLog = mongoose_1.default.models.ModLog || mongoose_1.default.model('ModLog', LogSchema);
async function connectMongo(uri) { await mongoose_1.default.connect(uri); console.log('MongoDB connected'); }
