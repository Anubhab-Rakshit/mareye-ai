import mongoose, { Schema, Document, models } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  dob?: string;
  email: string;
  password: string;
  avatar?: string;
  subscription: {
    plan: 'basic' | 'pro' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled';
    startDate?: Date;
    endDate?: Date;
    paymentId?: string;
  };
  tokens: {
    dailyLimit: number;
    usedToday: number;
    lastResetDate: Date;
    totalUsed: number;
  };
  paymentHistory: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    date: Date;
    plan: string;
  }>;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
    subscription: {
      plan: { type: String, enum: ['basic', 'pro', 'enterprise'], default: 'basic' },
      status: { type: String, enum: ['active', 'inactive', 'cancelled'], default: 'active' },
      startDate: { type: Date },
      endDate: { type: Date },
      paymentId: { type: String }
    },
    tokens: {
      dailyLimit: { type: Number, default: 10 },
      usedToday: { type: Number, default: 0 },
      lastResetDate: { type: Date, default: Date.now },
      totalUsed: { type: Number, default: 0 }
    },
    paymentHistory: [{
      id: { type: String, required: true },
      amount: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
      status: { type: String, required: true },
      date: { type: Date, default: Date.now },
      plan: { type: String, required: true }
    }]
  },
  { timestamps: true }
);

// Prevent recompiling model in dev hot reload
const User = models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
