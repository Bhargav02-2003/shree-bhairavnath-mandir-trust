export interface User {
  id: string;
  uuid?: string;
  name: string;
  username: string;
  email: string | null;
  role: "super_admin" | "user" | "trustee";
  status: "active" | "inactive";
  permissions?: string; // comma-separated e.g. "read,write,update,delete"
  trusteePermissions?: {
    [module: string]: {
      read: boolean;
      write: boolean;
      update: boolean;
    }
  };
}

export interface TrusteePermission {
  uuid: string;
  trusteeUuid: string;
  moduleName: string;
  canRead: boolean;
  canWrite: boolean;
  canUpdate: boolean;
}

export interface Trustee {
  id: string;
  fullName: string;
  username: string;
  mobile: string | null;
  email: string | null;
  designation: string | null;
  profilePhoto: string | null;
  status: "active" | "inactive";
  permissions?: TrusteePermission[];
  createdAt: string;
}

export interface Receipt {
  id: string;
  receiptNo: string;
  name: string;
  reason: string;
  amount: number | null;
  foodName: string | null;
  foodQty: number | null;
  image: string;
  createdDate: string;
  createdBy: string;
  mobile: string;
  address: string | null;
  paymentMode?: string;
}

export interface Expense {
  id: string;
  name: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  bill: string;
  createdBy: string;
  paymentMode?: string;
}

export interface TempleEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  image: string;
  location: string;
  eventStatus: "upcoming" | "completed" | "cancelled";
  status: "active" | "inactive";
}

export interface Banner {
  id: string;
  title: string;
  image?: string | null;
  description?: string | null;
  color?: string | null;
  fontStyle?: string | null;
  expiresAt?: string | null;
  active: boolean;
  status?: "active" | "inactive";
}

export interface SliderImage {
  id: string;
  image: string;
  title: string;
  active: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  user: string;
  timestamp: string;
}

export interface DashboardSummary {
  totalReceipts: number;
  totalExpenses: number;
  upcomingEvents: number;
  yearlyEvents: number;
  monthlyEvents: number;
  recentActivities: ActivityLog[];
}

export interface BoardMember {
  id: string;
  name: string;
  designation: string | null;
  profilePhoto: string | null;
  displayOrder: number;
  status: "active" | "inactive";
}
