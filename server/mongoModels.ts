import mongoose, { Schema, Model } from "mongoose";

const schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc: any, ret: any) => {
      ret.id = ret.uuid;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (_doc: any, ret: any) => {
      ret.id = ret.uuid;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
};

// User Schema
export interface IUser {
  uuid: string;
  name: string;
  username: string;
  password: string;
  email: string;
  role: "super_admin" | "user";
  status: "active" | "inactive";
  permissions: string;
  authorUuid?: string | null;
}

const UserSchema = new Schema<IUser>(
  {
    uuid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ["super_admin", "user"], default: "user" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    permissions: { type: String, default: "read" },
    authorUuid: { type: String, default: null },
  },
  schemaOptions
);

// Receipt Schema
export interface IReceipt {
  uuid: string;
  receiptNo: string;
  name: string;
  reason: string;
  amount?: number | null;
  foodName?: string | null;
  foodQty?: number | null;
  image: string;
  createdDate: string;
  createdBy: string;
  status: "active" | "inactive";
  authorUuid?: string | null;
  mobile: string;
  address?: string | null;
  paymentMode: string;
}

const ReceiptSchema = new Schema<IReceipt>(
  {
    uuid: { type: String, required: true },
    receiptNo: { type: String, required: true },
    name: { type: String, required: true },
    reason: { type: String, required: true },
    amount: { type: Number, default: null },
    foodName: { type: String, default: null },
    foodQty: { type: Number, default: null },
    image: { type: String, required: true },
    createdDate: { type: String, required: true },
    createdBy: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    authorUuid: { type: String, default: null },
    mobile: { type: String, default: "" },
    address: { type: String, default: null },
    paymentMode: { type: String, default: "Cash" },
  },
  schemaOptions
);

// Expense Schema
export interface IExpense {
  uuid: string;
  name: string;
  category: string;
  amount: number;
  description?: string | null;
  date: string;
  bill: string;
  createdBy: string;
  status: "active" | "inactive";
  authorUuid?: string | null;
  paymentMode: string;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    uuid: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String, default: null },
    date: { type: String, required: true },
    bill: { type: String, required: true },
    createdBy: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    authorUuid: { type: String, default: null },
    paymentMode: { type: String, default: "Cash" },
  },
  schemaOptions
);

// Yearly Event Schema
export interface IYearlyEvent {
  uuid: string;
  title: string;
  description: string;
  date: string;
  image: string;
  location: string;
  eventStatus: "upcoming" | "completed" | "cancelled";
  status: "active" | "inactive";
  authorUuid?: string | null;
}

const YearlyEventSchema = new Schema<IYearlyEvent>(
  {
    uuid: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    image: { type: String, required: true },
    location: { type: String, required: true },
    eventStatus: { type: String, enum: ["upcoming", "completed", "cancelled"], default: "upcoming" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    authorUuid: { type: String, default: null },
  },
  schemaOptions
);

// Monthly Event Schema
export interface IMonthlyEvent {
  uuid: string;
  title: string;
  description: string;
  date: string;
  image: string;
  location: string;
  eventStatus: "upcoming" | "completed" | "cancelled";
  status: "active" | "inactive";
  authorUuid?: string | null;
}

const MonthlyEventSchema = new Schema<IMonthlyEvent>(
  {
    uuid: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    image: { type: String, required: true },
    location: { type: String, required: true },
    eventStatus: { type: String, enum: ["upcoming", "completed", "cancelled"], default: "upcoming" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    authorUuid: { type: String, default: null },
  },
  schemaOptions
);

// Banner Schema
export interface IBanner {
  uuid: string;
  image?: string | null;
  title: string;
  description?: string | null;
  color?: string | null;
  fontStyle?: string | null;
  expiresAt?: Date | null;
  active: boolean;
  status: "active" | "inactive";
  authorUuid?: string | null;
}

const BannerSchema = new Schema<IBanner>(
  {
    uuid: { type: String, required: true },
    image: { type: String, default: null },
    title: { type: String, required: true },
    description: { type: String, default: null },
    color: { type: String, default: null },
    fontStyle: { type: String, default: null },
    expiresAt: { type: Date, default: null },
    active: { type: Boolean, default: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    authorUuid: { type: String, default: null },
  },
  schemaOptions
);

// Slider Image Schema
export interface ISliderImage {
  uuid: string;
  image: string;
  title: string;
  active: boolean;
  status: "active" | "inactive";
  authorUuid?: string | null;
}

const SliderImageSchema = new Schema<ISliderImage>(
  {
    uuid: { type: String, required: true },
    image: { type: String, required: true },
    title: { type: String, required: true },
    active: { type: Boolean, default: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    authorUuid: { type: String, default: null },
  },
  schemaOptions
);

// Activity Log Schema
export interface IActivityLog {
  uuid: string;
  apiUuid?: string | null;
  action: string;
  details: string;
  user: string;
  timestamp: Date;
  status: "active" | "inactive";
  authorUuid?: string | null;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    uuid: { type: String, required: true },
    apiUuid: { type: String, default: null },
    action: { type: String, required: true },
    details: { type: String, required: true },
    user: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    authorUuid: { type: String, default: null },
  },
  schemaOptions
);

// Trustee Schema
export interface ITrustee {
  uuid: string;
  fullName: string;
  username: string;
  passwordHash: string;
  mobile?: string | null;
  email?: string | null;
  designation?: string | null;
  profilePhoto?: string | null;
  status: "active" | "inactive";
  authorUuid?: string | null;
}

const TrusteeSchema = new Schema<ITrustee>(
  {
    uuid: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    mobile: { type: String, default: null },
    email: { type: String, default: null },
    designation: { type: String, default: null },
    profilePhoto: { type: String, default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    authorUuid: { type: String, default: null },
  },
  schemaOptions
);

// Trustee Permission Schema
export interface ITrusteePermission {
  uuid: string;
  trusteeUuid: string;
  moduleName: string;
  canRead: boolean;
  canWrite: boolean;
  canUpdate: boolean;
  status: "active" | "inactive";
  authorUuid?: string | null;
}

const TrusteePermissionSchema = new Schema<ITrusteePermission>(
  {
    uuid: { type: String, required: true },
    trusteeUuid: { type: String, required: true },
    moduleName: { type: String, required: true },
    canRead: { type: Boolean, default: false },
    canWrite: { type: Boolean, default: false },
    canUpdate: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    authorUuid: { type: String, default: null },
  },
  schemaOptions
);

// Board Member Schema
export interface IBoardMember {
  uuid: string;
  name: string;
  designation?: string | null;
  profilePhoto?: string | null;
  displayOrder: number;
  status: "active" | "inactive";
  authorUuid?: string | null;
}

const BoardMemberSchema = new Schema<IBoardMember>(
  {
    uuid: { type: String, required: true },
    name: { type: String, required: true },
    designation: { type: String, default: null },
    profilePhoto: { type: String, default: null },
    displayOrder: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    authorUuid: { type: String, default: null },
  },
  schemaOptions
);

export const MongoUser: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export const MongoReceipt: Model<IReceipt> = mongoose.models.Receipt || mongoose.model<IReceipt>("Receipt", ReceiptSchema);
export const MongoExpense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);
export const MongoYearlyEvent: Model<IYearlyEvent> = mongoose.models.YearlyEvent || mongoose.model<IYearlyEvent>("YearlyEvent", YearlyEventSchema);
export const MongoMonthlyEvent: Model<IMonthlyEvent> = mongoose.models.MonthlyEvent || mongoose.model<IMonthlyEvent>("MonthlyEvent", MonthlyEventSchema);
export const MongoBanner: Model<IBanner> = mongoose.models.Banner || mongoose.model<IBanner>("Banner", BannerSchema);
export const MongoSliderImage: Model<ISliderImage> = mongoose.models.SliderImage || mongoose.model<ISliderImage>("SliderImage", SliderImageSchema);
export const MongoActivityLog: Model<IActivityLog> = mongoose.models.ActivityLog || mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
export const MongoTrustee: Model<ITrustee> = mongoose.models.Trustee || mongoose.model<ITrustee>("Trustee", TrusteeSchema);
export const MongoTrusteePermission: Model<ITrusteePermission> = mongoose.models.TrusteePermission || mongoose.model<ITrusteePermission>("TrusteePermission", TrusteePermissionSchema);
export const MongoBoardMember: Model<IBoardMember> = mongoose.models.BoardMember || mongoose.model<IBoardMember>("BoardMember", BoardMemberSchema);
