import { Sequelize, DataTypes, Model } from "sequelize";
import path from "path";
import bcrypt from "bcryptjs";
import "dotenv/config";
import mysql from "mysql2/promise";

const isMysql = process.env.DB_HOST && process.env.DB_DATABASE;

export const sequelize = isMysql
  ? new Sequelize(
      process.env.DB_DATABASE!,
      process.env.DB_USER || process.env.DB_USERNAME || "root",
      process.env.DB_PASSWORD || "",
      {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "3306", 10),
        dialect: "mysql",
        logging: false,
      }
    )
  : new Sequelize({
      dialect: "sqlite",
      storage: path.join(process.cwd(), "database.sqlite"),
      logging: false,
    });

// User Model
export class User extends Model {
  public uuid!: string;
  public name!: string;
  public username!: string;
  public password!: string;
  public email!: string;
  public role!: "super_admin" | "user";
  public status!: "active" | "inactive";
  public permissions!: string; // comma separated: "read,write,update,delete"
  public authorUuid!: string | null;

  public toJSON(): any {
    const values = super.toJSON();
    values.id = this.uuid;
    return values;
  }
}

User.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("super_admin", "user"),
      allowNull: false,
      defaultValue: "user",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    permissions: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "read",
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "users",
  }
);

// Receipt Model
export class Receipt extends Model {
  public uuid!: string;
  public receiptNo!: string;
  public name!: string;
  public reason!: string;
  public amount!: number | null;
  public foodName!: string | null;
  public foodQty!: number | null;
  public image!: string;
  public createdDate!: string;
  public createdBy!: string;
  public status!: "active" | "inactive";
  public authorUuid!: string | null;
  public mobile!: string;
  public address!: string | null;
  public paymentMode!: string;

  public toJSON(): any {
    const values = super.toJSON();
    values.id = this.uuid;
    return values;
  }
}

Receipt.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    receiptNo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false, // Turned off unique constraint to support append-only updates/history
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    foodName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    foodQty: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentMode: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Cash",
    },
  },
  {
    sequelize,
    tableName: "receipts",
  }
);

// Expense Model
export class Expense extends Model {
  public uuid!: string;
  public name!: string;
  public category!: string;
  public amount!: number;
  public description!: string;
  public date!: string;
  public bill!: string;
  public createdBy!: string;
  public status!: "active" | "inactive";
  public authorUuid!: string | null;
  public paymentMode!: string;

  public toJSON(): any {
    const values = super.toJSON();
    values.id = this.uuid;
    return values;
  }
}

Expense.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    bill: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    paymentMode: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Cash",
    },
  },
  {
    sequelize,
    tableName: "expenses",
  }
);

// YearlyEvent Model
export class YearlyEvent extends Model {
  public uuid!: string;
  public title!: string;
  public description!: string;
  public date!: string;
  public image!: string;
  public location!: string;
  public eventStatus!: "upcoming" | "completed" | "cancelled";
  public status!: "active" | "inactive";
  public authorUuid!: string | null;

  public toJSON(): any {
    const values = super.toJSON();
    values.id = this.uuid;
    return values;
  }
}

YearlyEvent.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    eventStatus: {
      type: DataTypes.ENUM("upcoming", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "upcoming",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "yearly_events",
  }
);

// MonthlyEvent Model
export class MonthlyEvent extends Model {
  public uuid!: string;
  public title!: string;
  public description!: string;
  public date!: string;
  public image!: string;
  public location!: string;
  public eventStatus!: "upcoming" | "completed" | "cancelled";
  public status!: "active" | "inactive";
  public authorUuid!: string | null;

  public toJSON(): any {
    const values = super.toJSON();
    values.id = this.uuid;
    return values;
  }
}

MonthlyEvent.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    eventStatus: {
      type: DataTypes.ENUM("upcoming", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "upcoming",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "monthly_events",
  }
);

// Banner Model
export class Banner extends Model {
  public uuid!: string;
  public image!: string | null;
  public title!: string;
  public description!: string | null;
  public color!: string | null;
  public fontStyle!: string | null;
  public expiresAt!: Date | null;
  public active!: boolean;
  public status!: "active" | "inactive";
  public authorUuid!: string | null;

  public toJSON(): any {
    const values = super.toJSON();
    values.id = this.uuid;
    return values;
  }
}

Banner.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fontStyle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "banners",
  }
);

// SliderImage Model
export class SliderImage extends Model {
  public uuid!: string;
  public image!: string;
  public title!: string;
  public active!: boolean;
  public status!: "active" | "inactive";
  public authorUuid!: string | null;

  public toJSON(): any {
    const values = super.toJSON();
    values.id = this.uuid;
    return values;
  }
}

SliderImage.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "slider_images",
  }
);

// ActivityLog Model
export class ActivityLog extends Model {
  public uuid!: string;
  public apiUuid!: string | null;
  public action!: string;
  public details!: string;
  public user!: string;
  public timestamp!: Date;
  public status!: "active" | "inactive";
  public authorUuid!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public toJSON(): any {
    const values = super.toJSON();
    values.id = this.uuid;
    return values;
  }
}

ActivityLog.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    apiUuid: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    user: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "activity_logs",
    timestamps: true,
  }
);

// Trustee Model
export class Trustee extends Model {
  public uuid!: string;
  public fullName!: string;
  public username!: string;
  public passwordHash!: string;
  public mobile!: string | null;
  public email!: string | null;
  public designation!: string | null;
  public profilePhoto!: string | null;
  public status!: "active" | "inactive";
  public authorUuid!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public toJSON(): any {
    const values = super.toJSON();
    values.id = this.uuid;
    return values;
  }
}

Trustee.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profilePhoto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "trustees",
  }
);

// TrusteePermission Model
export class TrusteePermission extends Model {
  public uuid!: string;
  public trusteeUuid!: string;
  public moduleName!: string;
  public canRead!: boolean;
  public canWrite!: boolean;
  public canUpdate!: boolean;
  public status!: "active" | "inactive";
  public authorUuid!: string | null;

  public toJSON(): any {
    const values = super.toJSON();
    values.id = this.uuid;
    return values;
  }
}

TrusteePermission.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    trusteeUuid: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    moduleName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    canRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    canWrite: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    canUpdate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "trustee_permissions",
  }
);

// Define associations
Trustee.hasMany(TrusteePermission, { as: "permissions", foreignKey: "trusteeUuid", onDelete: "CASCADE" });
TrusteePermission.belongsTo(Trustee, { foreignKey: "trusteeUuid" });

// BoardMember Model
export class BoardMember extends Model {
  public uuid!: string;
  public name!: string;
  public designation!: string | null;
  public profilePhoto!: string | null;
  public displayOrder!: number;
  public status!: "active" | "inactive";
  public authorUuid!: string | null;

  public toJSON(): any {
    const values = super.toJSON();
    values.id = this.uuid;
    return values;
  }
}

BoardMember.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profilePhoto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "board_members",
  }
);

// Seeding function
export async function initDatabase() {
  if (isMysql) {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "3306", 10),
        user: process.env.DB_USER || process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || "",
      });
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_DATABASE}\`;`);
      await connection.end();
      console.log(`Database '${process.env.DB_DATABASE}' verified/created.`);
    } catch (dbErr) {
      console.warn("Could not pre-create database via mysql2 connection. Relying on existing database or connection params:", dbErr);
    }
  }

  try {
    await sequelize.sync({ alter: true });
  } catch (err) {
    console.warn("Alter sync failed, recreating database tables (force: true):", err);
    await sequelize.sync({ force: true });
  }

  const userCount = await User.count();
  if (userCount === 0) {
    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Super Admin",
      username: "admin",
      password: hashedPassword,
      email: "admin@bhairavnathmandir.org",
      role: "super_admin",
      status: "active",
      permissions: "read,write,update,delete",
    });

    const userPassword = await bcrypt.hash("user123", 10);
    await User.create({
      name: "Mandir Priest",
      username: "priest",
      password: userPassword,
      email: "priest@bhairavnathmandir.org",
      role: "user",
      status: "active",
      permissions: "read,write,update",
    });

    console.log("Database seeded with default users: admin (admin123), priest (user123)");

    // Sample slider images (using high quality public temple image placeholders)
    await SliderImage.bulkCreate([
      {
        image: "https://images.unsplash.com/photo-1608958416715-bc44a08cb36d?auto=format&fit=crop&q=80&w=1200",
        title: "Maha Shivratri Sringar 2026",
        active: true,
      },
      {
        image: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&q=80&w=1200",
        title: "Bhairavnath Jayanti Mahotsav",
        active: true,
      },
      {
        image: "https://images.unsplash.com/photo-1561361513-2d000a50f0db?auto=format&fit=crop&q=80&w=1200",
        title: "Grand Palkhi Sohala Festival",
        active: true,
      },
    ]);

    // Sample banners
    await Banner.bulkCreate([
      {
        image: "https://images.unsplash.com/photo-1609137144814-7f897686523c?auto=format&fit=crop&q=80&w=600",
        title: "Daily Bhakti Aarti Schedule",
        active: true,
        status: "active",
      },
      {
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600",
        title: "Donation For Temple Renovation Scheme",
        active: true,
        status: "active",
      },
    ]);

    // Sample events
    await YearlyEvent.bulkCreate([
      {
        title: "Shree Bhairavnath Annual Palkhi Sohala",
        description: "The grand annual processional chariot ceremony with thousands of devotees matching holy beats of Dhol-Tasha.",
        date: "2026-11-20",
        image: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&q=80&w=600",
        location: "Mandir Main Precincts to Village Square",
        eventStatus: "upcoming",
        status: "active",
      },
      {
        title: "Maha Shivratri Grand Abhishek",
        description: "Rudra-Abhishek of Shree Bhairavnath with continuous chanting of vedic hymns and distributing Mahaprasad.",
        date: "2026-03-05",
        image: "https://images.unsplash.com/photo-1608958416715-bc44a08cb36d?auto=format&fit=crop&q=80&w=600",
        location: "Garbhgruha (Inner Sanctum)",
        eventStatus: "completed",
        status: "active",
      },
    ]);

    await MonthlyEvent.bulkCreate([
      {
        title: "Kaalbhairav Ashtami Havan",
        description: "Special powerful monthly havan ritual performed during Ashtami Tithi for divine protections.",
        date: "2026-08-05",
        image: "https://images.unsplash.com/photo-1561361513-2d000a50f0db?auto=format&fit=crop&q=80&w=600",
        location: "Yajna Shala",
        eventStatus: "upcoming",
        status: "active",
      },
      {
        title: "Monthly Mahaprasad Distribution",
        description: "Free community kitchen serving hot, nutritious meals to over 5,000 pilgrims on Amavasya.",
        date: "2026-07-28",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600",
        location: "Annachhatra Hall",
        eventStatus: "upcoming",
        status: "active",
      },
    ]);

    // Sample Receipts
    await Receipt.bulkCreate([
      {
        receiptNo: "REC-1001",
        name: "Rajesh Ramchandra Patil",
        reason: "General Donation",
        amount: 5001,
        foodName: null,
        foodQty: null,
        image: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=300",
        createdDate: "2026-07-15",
        createdBy: "admin",
        mobile: "9876543210",
        address: "Talwade, Pune",
      },
      {
        receiptNo: "REC-1002",
        name: "Sunita Kishor Deshmukh",
        reason: "Food",
        amount: null,
        foodName: "Basmati Rice",
        foodQty: 100,
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300",
        createdDate: "2026-07-16",
        createdBy: "priest",
        mobile: "9876543211",
        address: "Chinchwad, Pune",
      },
      {
        receiptNo: "REC-1003",
        name: "Abhay Dinkar Joshi",
        reason: "Abhishek Pooja Sewa",
        amount: 1500,
        foodName: null,
        foodQty: null,
        image: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&q=80&w=300",
        createdDate: "2026-07-17",
        createdBy: "priest",
        mobile: "9876543212",
        address: "Hadapsar, Pune",
      },
    ]);

    // Sample Expenses
    await Expense.bulkCreate([
      {
        name: "Purchase of Havan Samagri",
        category: "Rituals & Pooja",
        amount: 8750,
        description: "Purchased high-grade natural herbs, camphor, ghee and dry woods for Ashtami Havan.",
        date: "2026-07-04",
        bill: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=300",
        createdBy: "admin",
      },
      {
        name: "Mandir Outer Painting Touchup",
        category: "Maintenance",
        amount: 14200,
        description: "Payment made to painters for touchup of main entrance arches before Palkhi.",
        date: "2026-07-10",
        bill: "https://images.unsplash.com/photo-1561361513-2d000a50f0db?auto=format&fit=crop&q=80&w=300",
        createdBy: "admin",
      },
    ]);

    // Sample Logs
    await ActivityLog.bulkCreate([
      {
        action: "DATABASE_INITIALIZED",
        details: "System successfully configured and seeded with sample data.",
        user: "system",
      },
    ]);
  }
}
