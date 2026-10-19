// server/serverless.ts
import "dotenv/config";
import express from "express";

// server/db.ts
import { Sequelize, DataTypes, Model } from "sequelize";
import path from "path";
import bcrypt from "bcryptjs";
import "dotenv/config";
import mysql from "mysql2/promise";
import mongoose from "mongoose";
var isMysql = process.env.DB_HOST && process.env.DB_DATABASE;
var isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
var sequelize = isMysql ? new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER || process.env.DB_USERNAME || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "3306", 10),
    dialect: "mysql",
    logging: false
  }
) : new Sequelize({
  dialect: "sqlite",
  storage: isServerless ? path.join("/tmp", "database.sqlite") : path.join(process.cwd(), "database.sqlite"),
  logging: false
});
var User = class extends Model {
  toJSON() {
    const values = super.toJSON();
    values.id = this.uuid;
    return values;
  }
};
User.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM("super_admin", "user"),
      allowNull: false,
      defaultValue: "user"
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active"
    },
    permissions: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "read"
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "users"
  }
);
var Receipt = class extends Model {
  toJSON() {
    const values = super.toJSON();
    values.id = this.uuid;
    return values;
  }
};
Receipt.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    receiptNo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false
      // Turned off unique constraint to support append-only updates/history
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    foodName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    foodQty: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active"
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: true
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ""
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    paymentMode: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Cash"
    }
  },
  {
    sequelize,
    tableName: "receipts"
  }
);
var Expense = class extends Model {
  toJSON() {
    const values = super.toJSON();
    values.id = this.uuid;
    return values;
  }
};
Expense.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    bill: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active"
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: true
    },
    paymentMode: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Cash"
    }
  },
  {
    sequelize,
    tableName: "expenses"
  }
);
var YearlyEvent = class extends Model {
  toJSON() {
    const values = super.toJSON();
    values.id = this.uuid;
    return values;
  }
};
YearlyEvent.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    eventStatus: {
      type: DataTypes.ENUM("upcoming", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "upcoming"
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active"
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "yearly_events"
  }
);
var MonthlyEvent = class extends Model {
  toJSON() {
    const values = super.toJSON();
    values.id = this.uuid;
    return values;
  }
};
MonthlyEvent.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    eventStatus: {
      type: DataTypes.ENUM("upcoming", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "upcoming"
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active"
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "monthly_events"
  }
);
var Banner = class extends Model {
  toJSON() {
    const values = super.toJSON();
    values.id = this.uuid;
    return values;
  }
};
Banner.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fontStyle: {
      type: DataTypes.STRING,
      allowNull: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active"
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "banners"
  }
);
var SliderImage = class extends Model {
  toJSON() {
    const values = super.toJSON();
    values.id = this.uuid;
    return values;
  }
};
SliderImage.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active"
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "slider_images"
  }
);
var ActivityLog = class extends Model {
  toJSON() {
    const values = super.toJSON();
    values.id = this.uuid;
    return values;
  }
};
ActivityLog.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    apiUuid: {
      type: DataTypes.UUID,
      allowNull: true
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    user: {
      type: DataTypes.STRING,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active"
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "activity_logs",
    timestamps: true
  }
);
var Trustee = class extends Model {
  toJSON() {
    const values = super.toJSON();
    values.id = this.uuid;
    return values;
  }
};
Trustee.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profilePhoto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active"
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "trustees"
  }
);
var TrusteePermission = class extends Model {
  toJSON() {
    const values = super.toJSON();
    values.id = this.uuid;
    return values;
  }
};
TrusteePermission.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    trusteeUuid: {
      type: DataTypes.UUID,
      allowNull: false
    },
    moduleName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    canRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    canWrite: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    canUpdate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active"
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "trustee_permissions"
  }
);
Trustee.hasMany(TrusteePermission, { as: "permissions", foreignKey: "trusteeUuid", onDelete: "CASCADE" });
TrusteePermission.belongsTo(Trustee, { foreignKey: "trusteeUuid" });
var BoardMember = class extends Model {
  toJSON() {
    const values = super.toJSON();
    values.id = this.uuid;
    return values;
  }
};
BoardMember.init(
  {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profilePhoto: {
      type: DataTypes.STRING,
      allowNull: true
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active"
    },
    authorUuid: {
      type: DataTypes.UUID,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "board_members"
  }
);
async function initDatabase() {
  const mongoUri = process.env.MONGODB_URI || "mongodb+srv://shreebhairavnathmandirtalawade_db_user:U7qVMP2fol9BLuGt@cluster0.uylgr4o.mongodb.net/shreebhairavnath?retryWrites=true&w=majority&appName=Cluster0";
  if (mongoUri) {
    if (mongoUri.includes("<db_password>")) {
      console.warn("MongoDB connection URI is configured, but contains '<db_password>' placeholder. Replace <db_password> with actual password in .env.");
    } else {
      try {
        if (mongoose.connection.readyState === 0) {
          await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5e3
          });
          console.log("Connected to MongoDB database successfully!");
        }
      } catch (mongoErr) {
        console.error("MongoDB connection failed:", mongoErr);
      }
    }
  }
  if (isServerless) {
    return;
  }
  if (isMysql) {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "3306", 10),
        user: process.env.DB_USER || process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || ""
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
    try {
      await sequelize.sync({ force: true });
    } catch {
      console.warn("SQLite database sync bypassed (using MongoDB layer)");
    }
  }
  try {
    const userCount = await User.count();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Super Admin",
        username: "admin",
        password: hashedPassword,
        email: "admin@bhairavnathmandir.org",
        role: "super_admin",
        status: "active",
        permissions: "read,write,update,delete"
      });
      const userPassword = await bcrypt.hash("user123", 10);
      await User.create({
        name: "Mandir Priest",
        username: "priest",
        password: userPassword,
        email: "priest@bhairavnathmandir.org",
        role: "user",
        status: "active",
        permissions: "read,write,update"
      });
      console.log("Database seeded with default users: admin (admin123), priest (user123)");
      await SliderImage.bulkCreate([
        {
          image: "https://images.unsplash.com/photo-1608958416715-bc44a08cb36d?auto=format&fit=crop&q=80&w=1200",
          title: "Maha Shivratri Sringar 2026",
          active: true
        },
        {
          image: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&q=80&w=1200",
          title: "Bhairavnath Jayanti Mahotsav",
          active: true
        },
        {
          image: "https://images.unsplash.com/photo-1561361513-2d000a50f0db?auto=format&fit=crop&q=80&w=1200",
          title: "Grand Palkhi Sohala Festival",
          active: true
        }
      ]);
      await Banner.bulkCreate([
        {
          image: "https://images.unsplash.com/photo-1609137144814-7f897686523c?auto=format&fit=crop&q=80&w=600",
          title: "Daily Bhakti Aarti Schedule",
          active: true,
          status: "active"
        },
        {
          image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600",
          title: "Donation For Temple Renovation Scheme",
          active: true,
          status: "active"
        }
      ]);
      await YearlyEvent.bulkCreate([
        {
          title: "Shree Bhairavnath Annual Palkhi Sohala",
          description: "The grand annual processional chariot ceremony with thousands of devotees matching holy beats of Dhol-Tasha.",
          date: "2026-11-20",
          image: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&q=80&w=600",
          location: "Mandir Main Precincts to Village Square",
          eventStatus: "upcoming",
          status: "active"
        },
        {
          title: "Maha Shivratri Grand Abhishek",
          description: "Rudra-Abhishek of Shree Bhairavnath with continuous chanting of vedic hymns and distributing Mahaprasad.",
          date: "2026-03-05",
          image: "https://images.unsplash.com/photo-1608958416715-bc44a08cb36d?auto=format&fit=crop&q=80&w=600",
          location: "Garbhgruha (Inner Sanctum)",
          eventStatus: "completed",
          status: "active"
        }
      ]);
      await MonthlyEvent.bulkCreate([
        {
          title: "Kaalbhairav Ashtami Havan",
          description: "Special powerful monthly havan ritual performed during Ashtami Tithi for divine protections.",
          date: "2026-08-05",
          image: "https://images.unsplash.com/photo-1561361513-2d000a50f0db?auto=format&fit=crop&q=80&w=600",
          location: "Yajna Shala",
          eventStatus: "upcoming",
          status: "active"
        },
        {
          title: "Monthly Mahaprasad Distribution",
          description: "Free community kitchen serving hot, nutritious meals to over 5,000 pilgrims on Amavasya.",
          date: "2026-07-28",
          image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=600",
          location: "Annachhatra Hall",
          eventStatus: "upcoming",
          status: "active"
        }
      ]);
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
          address: "Talwade, Pune"
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
          address: "Chinchwad, Pune"
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
          address: "Hadapsar, Pune"
        }
      ]);
      await Expense.bulkCreate([
        {
          name: "Purchase of Havan Samagri",
          category: "Rituals & Pooja",
          amount: 8750,
          description: "Purchased high-grade natural herbs, camphor, ghee and dry woods for Ashtami Havan.",
          date: "2026-07-04",
          bill: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=300",
          createdBy: "admin"
        },
        {
          name: "Mandir Outer Painting Touchup",
          category: "Maintenance",
          amount: 14200,
          description: "Payment made to painters for touchup of main entrance arches before Palkhi.",
          date: "2026-07-10",
          bill: "https://images.unsplash.com/photo-1561361513-2d000a50f0db?auto=format&fit=crop&q=80&w=300",
          createdBy: "admin"
        }
      ]);
      await ActivityLog.bulkCreate([
        {
          action: "DATABASE_INITIALIZED",
          details: "System successfully configured and seeded with sample data.",
          user: "system"
        }
      ]);
    }
  } catch {
  }
}

// server/routes.ts
import { Router } from "express";
import mongoose3 from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt2 from "bcryptjs";
import multer from "multer";
import path2 from "path";
import fs from "fs";
import crypto from "crypto";

// server/mongoModels.ts
import mongoose2, { Schema } from "mongoose";
var schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret.uuid;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret.uuid;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
};
var UserSchema = new Schema(
  {
    uuid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ["super_admin", "user"], default: "user" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    permissions: { type: String, default: "read" },
    authorUuid: { type: String, default: null }
  },
  schemaOptions
);
var ReceiptSchema = new Schema(
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
    paymentMode: { type: String, default: "Cash" }
  },
  schemaOptions
);
var ExpenseSchema = new Schema(
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
    paymentMode: { type: String, default: "Cash" }
  },
  schemaOptions
);
var YearlyEventSchema = new Schema(
  {
    uuid: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    image: { type: String, required: true },
    location: { type: String, required: true },
    eventStatus: { type: String, enum: ["upcoming", "completed", "cancelled"], default: "upcoming" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    authorUuid: { type: String, default: null }
  },
  schemaOptions
);
var MonthlyEventSchema = new Schema(
  {
    uuid: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    image: { type: String, required: true },
    location: { type: String, required: true },
    eventStatus: { type: String, enum: ["upcoming", "completed", "cancelled"], default: "upcoming" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    authorUuid: { type: String, default: null }
  },
  schemaOptions
);
var BannerSchema = new Schema(
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
    authorUuid: { type: String, default: null }
  },
  schemaOptions
);
var SliderImageSchema = new Schema(
  {
    uuid: { type: String, required: true },
    image: { type: String, required: true },
    title: { type: String, required: true },
    active: { type: Boolean, default: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    authorUuid: { type: String, default: null }
  },
  schemaOptions
);
var ActivityLogSchema = new Schema(
  {
    uuid: { type: String, required: true },
    apiUuid: { type: String, default: null },
    action: { type: String, required: true },
    details: { type: String, required: true },
    user: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    authorUuid: { type: String, default: null }
  },
  schemaOptions
);
var TrusteeSchema = new Schema(
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
    authorUuid: { type: String, default: null }
  },
  schemaOptions
);
var TrusteePermissionSchema = new Schema(
  {
    uuid: { type: String, required: true },
    trusteeUuid: { type: String, required: true },
    moduleName: { type: String, required: true },
    canRead: { type: Boolean, default: false },
    canWrite: { type: Boolean, default: false },
    canUpdate: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    authorUuid: { type: String, default: null }
  },
  schemaOptions
);
var BoardMemberSchema = new Schema(
  {
    uuid: { type: String, required: true },
    name: { type: String, required: true },
    designation: { type: String, default: null },
    profilePhoto: { type: String, default: null },
    displayOrder: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    authorUuid: { type: String, default: null }
  },
  schemaOptions
);
var MongoUser = mongoose2.models.User || mongoose2.model("User", UserSchema);
var MongoReceipt = mongoose2.models.Receipt || mongoose2.model("Receipt", ReceiptSchema);
var MongoExpense = mongoose2.models.Expense || mongoose2.model("Expense", ExpenseSchema);
var MongoYearlyEvent = mongoose2.models.YearlyEvent || mongoose2.model("YearlyEvent", YearlyEventSchema);
var MongoMonthlyEvent = mongoose2.models.MonthlyEvent || mongoose2.model("MonthlyEvent", MonthlyEventSchema);
var MongoBanner = mongoose2.models.Banner || mongoose2.model("Banner", BannerSchema);
var MongoSliderImage = mongoose2.models.SliderImage || mongoose2.model("SliderImage", SliderImageSchema);
var MongoActivityLog = mongoose2.models.ActivityLog || mongoose2.model("ActivityLog", ActivityLogSchema);
var MongoTrustee = mongoose2.models.Trustee || mongoose2.model("Trustee", TrusteeSchema);
var MongoTrusteePermission = mongoose2.models.TrusteePermission || mongoose2.model("TrusteePermission", TrusteePermissionSchema);
var MongoBoardMember = mongoose2.models.BoardMember || mongoose2.model("BoardMember", BoardMemberSchema);

// server/translationMiddleware.ts
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
var translationCache = /* @__PURE__ */ new Map();
var staticDictionary = {
  "Food": "\u0905\u0928\u094D\u0928 \u0926\u093E\u0928",
  "General Donation": "\u0938\u093E\u0927\u093E\u0930\u0923 \u0926\u0947\u0923\u0917\u0940",
  "Renovation Scheme": "\u091C\u0940\u0930\u094D\u0923\u094B\u0926\u094D\u0927\u093E\u0930 \u092F\u094B\u091C\u0928\u093E",
  "Abhishek Pooja": "\u0905\u092D\u093F\u0937\u0947\u0915 \u092A\u0942\u091C\u093E",
  "Rituals & Poojas": "\u0927\u093E\u0930\u094D\u092E\u093F\u0915 \u0935\u093F\u0927\u0940 \u0906\u0923\u093F \u092A\u0942\u091C\u093E",
  "Rituals & Pooja": "\u0927\u093E\u0930\u094D\u092E\u093F\u0915 \u0935\u093F\u0927\u0940 \u0906\u0923\u093F \u092A\u0942\u091C\u093E",
  "Pooja & Vidhi": "\u092A\u0942\u091C\u093E \u0906\u0923\u093F \u0935\u093F\u0927\u0940",
  "Temple Maintenance": "\u092E\u0902\u0926\u093F\u0930 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0928 \u0935 \u0928\u093F\u0917\u093E",
  "Maintenance": "\u092E\u0902\u0926\u093F\u0930 \u0935\u094D\u092F\u0935\u0938\u094D\u0925\u093E\u092A\u0928 \u0935 \u0928\u093F\u0917\u093E",
  "Kitchen (Mahaprasad)": "\u092E\u0939\u093E\u092A\u094D\u0930\u0938\u093E\u0926 \u0938\u094D\u0935\u092F\u0902\u092A\u093E\u0915\u0918\u0930",
  "Salaries & Dakshina": "\u0935\u0947\u0924\u0928 \u0906\u0923\u093F \u092E\u093E\u0928\u0927\u0928",
  "Electricity & Utilities": "\u0935\u0940\u091C \u0906\u0923\u093F \u0907\u0924\u0930 \u092A\u093E\u0923\u0940 \u0926\u0947\u092F\u0915\u0947",
  "Prasad / Flowers": "\u092A\u094D\u0930\u0938\u093E\u0926 \u0906\u0923\u093F \u092B\u0941\u0932\u0947",
  "Festival Celebrations": "\u0909\u0924\u094D\u0938\u0935 \u0938\u094B\u0939\u0933\u0947",
  "Decoration & Lighting": "\u0938\u091C\u093E\u0935\u091F \u0906\u0923\u093F \u0930\u094B\u0937\u0923\u093E\u0908",
  "Construction & Repairs": "\u092C\u093E\u0902\u0927\u0915\u093E\u092E \u0906\u0923\u093F \u0926\u0941\u0930\u0941\u0938\u094D\u0924\u0940",
  "Administrative Expenses": "\u092A\u094D\u0930\u0936\u093E\u0938\u0915\u0940\u092F \u0916\u0930\u094D\u091A",
  "Charity & Social Work": "\u0926\u0947\u0923\u0917\u0940 \u0906\u0923\u093F \u0938\u092E\u093E\u091C\u0915\u093E\u0930\u094D\u092F",
  "Office & Stationeries": "\u0915\u093E\u0930\u094D\u092F\u093E\u0932\u092F \u0906\u0923\u093F \u0938\u094D\u091F\u0947\u0936\u0928\u0930\u0940",
  "Cash": "\u0930\u094B\u0916",
  "Check": "\u091A\u0947\u0915",
  "UPI": "\u092F\u0941\u092A\u0940\u0906\u092F",
  "Wheat": "\u0917\u0939\u0942",
  "Rice": "\u0924\u093E\u0902\u0926\u0942\u0933",
  "Dal": "\u0921\u093E\u0933",
  "Sugar": "\u0938\u093E\u0916\u0930",
  "Other": "\u0907\u0924\u0930",
  "Shree Bhairavnath Annual Palkhi Sohala": "\u0936\u094D\u0930\u0940 \u092D\u0948\u0930\u0935\u0928\u093E\u0925 \u0935\u093E\u0930\u094D\u0937\u093F\u0915 \u092A\u093E\u0932\u0916\u0940 \u0938\u094B\u0939\u0933\u093E",
  "Maha Shivratri Grand Abhishek": "\u092E\u0939\u093E\u0936\u093F\u0935\u0930\u093E\u0924\u094D\u0930\u0940 \u092D\u0935\u094D\u092F \u0905\u092D\u093F\u0937\u0947\u0915",
  "Kaalbhairav Ashtami Havan": "\u0915\u093E\u0933\u092D\u0948\u0930\u0935 \u0905\u0937\u094D\u091F\u092E\u0940 \u0939\u0935\u0928",
  "Monthly Mahaprasad Distribution": "\u092E\u093E\u0938\u093F\u0915 \u092E\u0939\u093E\u092A\u094D\u0930\u0938\u093E\u0926 \u0935\u093E\u091F\u092A",
  "Mandir Main Precincts to Village Square": "\u092E\u0902\u0926\u093F\u0930 \u092A\u0930\u093F\u0938\u0930 \u0924\u0947 \u0917\u093E\u0935\u091A\u093E \u091A\u093E\u0935\u0921\u0940 \u091A\u094C\u0915",
  "Garbhgruha (Inner Sanctum)": "\u0917\u093E\u092D\u093E\u0930\u093E (\u0917\u0930\u094D\u092D\u0917\u0943\u0939)",
  "Yajna Shala": "\u092F\u091C\u094D\u091E \u0936\u093E\u0933\u093E",
  "Annachhatra Hall": "\u0905\u0928\u094D\u0928\u091B\u0924\u094D\u0930 \u0939\u0949\u0932",
  "Active": "\u0938\u0915\u094D\u0930\u093F\u092F",
  "Inactive": "\u0928\u093F\u0937\u094D\u0915\u094D\u0930\u093F\u092F",
  "active": "\u0938\u0915\u094D\u0930\u093F\u092F",
  "inactive": "\u0928\u093F\u0937\u094D\u0915\u094D\u0930\u093F\u092F",
  "upcoming": "\u0906\u0917\u093E\u092E\u0940",
  "completed": "\u092A\u0942\u0930\u094D\u0923 \u091D\u093E\u0932\u0947",
  "cancelled": "\u0930\u0926\u094D\u0926 \u091D\u093E\u0932\u0947",
  "Super Admin": "\u0938\u0941\u092A\u0930 \u0972\u0921\u092E\u093F\u0928",
  "Trustee": "\u0935\u093F\u0936\u094D\u0935\u0938\u094D\u0924",
  "Mandir Priest": "\u092E\u0902\u0926\u093F\u0930 \u092A\u0941\u091C\u093E\u0930\u0940",
  "admin": "\u092A\u094D\u0930\u0936\u093E\u0938\u0915",
  "priest": "\u092A\u0941\u091C\u093E\u0930\u0940",
  "President": "\u0905\u0927\u094D\u092F\u0915\u094D\u0937",
  "Secretary": "\u0938\u091A\u093F\u0935",
  "Treasurer": "\u0916\u091C\u093F\u0928\u0926\u093E\u0930",
  "Member": "\u0938\u0926\u0938\u094D\u092F",
  "Purchase of Havan Samagri": "\u0939\u0935\u0928 \u0938\u093E\u092E\u0917\u094D\u0930\u0940 \u0916\u0930\u0947\u0926\u0940",
  "Mandir Outer Painting Touchup": "\u092E\u0902\u0926\u093F\u0930 \u092C\u093E\u0939\u094D\u092F \u0930\u0902\u0917\u0915\u093E\u092E \u0926\u0941\u0930\u0941\u0938\u094D\u0924\u0940",
  "Rajesh Ramchandra Patil": "\u0930\u093E\u091C\u0947\u0936 \u0930\u093E\u092E\u091A\u0902\u0926\u094D\u0930 \u092A\u093E\u091F\u0940\u0932",
  "Sunita Kishor Deshmukh": "\u0938\u0941\u0928\u093F\u0924\u093E \u0915\u093F\u0936\u094B\u0930 \u0926\u0947\u0936\u092E\u0941\u0916",
  "Abhay Dinkar Joshi": "\u0905\u092D\u092F \u0926\u093F\u0928\u0915\u0930 \u091C\u094B\u0936\u0940",
  "bhargav panchal": "\u092D\u093E\u0930\u094D\u0917\u0935 \u092A\u093E\u0902\u091A\u093E\u0933",
  "prashant singh": "\u092A\u094D\u0930\u0936\u093E\u0902\u0924 \u0938\u093F\u0902\u0917",
  "ajay": "\u0905\u091C\u092F",
  "Abhishek Pooja Sewa": "\u0905\u092D\u093F\u0937\u0947\u0915 \u092A\u0942\u091C\u093E \u0938\u0947\u0935\u093E",
  "Basmati Rice": "\u092C\u093E\u0938\u092E\u0924\u0940 \u0924\u093E\u0902\u0926\u0942\u0933",
  "shera": "\u0936\u0940\u0930\u093E",
  "Mahashivratri Mahotsav 2026": "\u092E\u0939\u093E\u0936\u093F\u0935\u0930\u093E\u0924\u094D\u0930\u0940 \u092E\u0939\u094B\u0924\u094D\u0938\u0935 \u0968\u0966\u0968\u096C",
  "Join us for the grand Mahashivratri celebration. Special pooja will start at 4:00 AM. Maha Prasad will be distributed from 12:00 PM.": "\u092D\u0935\u094D\u092F \u092E\u0939\u093E\u0936\u093F\u0935\u0930\u093E\u0924\u094D\u0930\u0940 \u0909\u0924\u094D\u0938\u0935\u093E\u0924 \u0938\u0939\u092D\u093E\u0917\u0940 \u0935\u094D\u0939\u093E. \u092A\u0939\u093E\u091F\u0947 \u096A:\u0966\u0966 \u0935\u093E\u091C\u0924\u093E \u0935\u093F\u0936\u0947\u0937 \u092A\u0942\u091C\u093E \u0938\u0941\u0930\u0942 \u0939\u094B\u0908\u0932. \u0926\u0941\u092A\u093E\u0930\u0940 \u0967\u0968:\u0966\u0966 \u0935\u093E\u091C\u0947\u092A\u093E\u0938\u0942\u0928 \u092E\u0939\u093E\u092A\u094D\u0930\u0938\u093E\u0926 \u0935\u093E\u091F\u092A \u0915\u0930\u0923\u094D\u092F\u093E\u0924 \u092F\u0947\u0908\u0932.",
  "Daily Bhakti Aarti Schedule": "\u0926\u0948\u0928\u093F\u0915 \u092D\u0915\u094D\u0924\u093F \u0906\u0930\u0924\u0940 \u0935\u0947\u0933\u093E\u092A\u0924\u094D\u0930\u0915",
  "Donation For Temple Renovation Scheme": "\u092E\u0902\u0926\u093F\u0930 \u091C\u0940\u0930\u094D\u0923\u094B\u0926\u094D\u0927\u093E\u0930 \u092F\u094B\u091C\u0928\u0947\u0938\u093E\u0920\u0940 \u0926\u0947\u0923\u0917\u0940"
};
Object.entries(staticDictionary).forEach(([en, mr]) => {
  translationCache.set(en.trim().toLowerCase(), mr);
});
var INDICTRANS2_URL = process.env.INDICTRANS2_URL || "http://localhost:8000/translate";
var geminiApiKey = process.env.GEMINI_API_KEY;
var aiClient = null;
if (geminiApiKey && geminiApiKey !== "MY_GEMINI_API_KEY") {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  } catch {
    aiClient = null;
  }
}
async function translateTextsToMarathi(texts) {
  if (!texts || texts.length === 0) return [];
  const results = new Array(texts.length);
  const missingIndices = [];
  const missingTexts = [];
  texts.forEach((text, idx) => {
    if (!text || typeof text !== "string" || text.trim() === "") {
      results[idx] = text;
      return;
    }
    const trimmed = text.trim();
    if (/^[\d\s.,\/#-]+$/.test(trimmed) || /^[0-9a-fA-F-]{36}$/.test(trimmed) || trimmed.includes("@") || trimmed.startsWith("http") || trimmed.startsWith("/uploads")) {
      results[idx] = text;
      return;
    }
    const lowerKey = trimmed.toLowerCase();
    if (translationCache.has(lowerKey)) {
      results[idx] = translationCache.get(lowerKey);
    } else {
      missingIndices.push(idx);
      missingTexts.push(trimmed);
    }
  });
  if (missingTexts.length === 0) {
    return results;
  }
  try {
    const response = await axios.post(INDICTRANS2_URL, {
      input: missingTexts,
      src_lang: "eng_Latn",
      tgt_lang: "mar_Deva"
    }, { timeout: 2e3 });
    if (response.data && Array.isArray(response.data.translations) && response.data.translations.length === missingTexts.length) {
      const translatedBatch = response.data.translations;
      missingIndices.forEach((origIdx, i) => {
        const tr = translatedBatch[i];
        results[origIdx] = tr;
        translationCache.set(missingTexts[i].toLowerCase(), tr);
      });
      return results;
    }
  } catch {
  }
  if (aiClient) {
    try {
      const prompt = `Translate the following English strings into natural Devanagari Marathi suitable for a Temple Trust portal. Return ONLY a JSON array of translated strings matching the exact input order.
Input: ${JSON.stringify(missingTexts)}`;
      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      const responseText = response.text || "";
      const jsonMatch = responseText.match(/\[.*\]/s);
      if (jsonMatch) {
        const parsedArray = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsedArray) && parsedArray.length === missingTexts.length) {
          missingIndices.forEach((origIdx, i) => {
            const tr = parsedArray[i];
            results[origIdx] = tr;
            translationCache.set(missingTexts[i].toLowerCase(), tr);
          });
          return results;
        }
      }
    } catch {
    }
  }
  missingIndices.forEach((origIdx, i) => {
    results[origIdx] = missingTexts[i];
  });
  return results;
}
var TRANSLATABLE_FIELDS = /* @__PURE__ */ new Set([
  "name",
  "reason",
  "description",
  "title",
  "foodName",
  "category",
  "location",
  "venue",
  "details",
  "designation",
  "action",
  "eventStatus",
  "fullName",
  "createdBy",
  "paymentMode"
]);
async function translateApiResponseObject(rawInput) {
  if (!rawInput) return rawInput;
  let data = rawInput;
  if (typeof data.toObject === "function") {
    data = data.toObject({ virtuals: true });
  } else if (data._doc && typeof data._doc === "object") {
    data = { ...data._doc };
  } else if (typeof data.toJSON === "function" && typeof data.save === "function") {
    data = data.toJSON();
  }
  if (typeof data !== "object") return data;
  if (Array.isArray(data)) {
    return Promise.all(data.map((item) => translateApiResponseObject(item)));
  }
  const keysToTranslate = [];
  const textValuesToTranslate = [];
  for (const key of Object.keys(data)) {
    if (TRANSLATABLE_FIELDS.has(key) && typeof data[key] === "string" && data[key].trim() !== "") {
      keysToTranslate.push(key);
      textValuesToTranslate.push(data[key]);
    }
  }
  const translatedValues = await translateTextsToMarathi(textValuesToTranslate);
  const result = { ...data };
  keysToTranslate.forEach((key, idx) => {
    result[key] = translatedValues[idx];
  });
  for (const key of Object.keys(result)) {
    if (key === "data" && Array.isArray(result.data)) {
      result.data = await Promise.all(result.data.map((item) => translateApiResponseObject(item)));
    } else if (typeof result[key] === "object" && result[key] !== null && key !== "trusteePermissions" && key !== "permissions") {
      result[key] = await translateApiResponseObject(result[key]);
    }
  }
  return result;
}
var responseTranslationMiddleware = (req, res, next) => {
  const rawLangHeader = (req.headers["accept-language"] || req.query.lang || "mr").toString().toLowerCase();
  const isMarathiRequested = !rawLangHeader.includes("en") || rawLangHeader.includes("mr") || rawLangHeader.includes("marathi");
  if (isMarathiRequested) {
    const originalJson = res.json.bind(res);
    res.json = function(body) {
      if (res.statusCode >= 400 || req.path.endsWith("/login") || req.path.endsWith("/upload")) {
        return originalJson(body);
      }
      translateApiResponseObject(body).then((translatedBody) => originalJson(translatedBody)).catch((err) => {
        console.error("Translation middleware error:", err);
        originalJson(body);
      });
      return res;
    };
  }
  next();
};

// server/routes.ts
var apiRouter = Router();
apiRouter.use(responseTranslationMiddleware);
apiRouter.use((req, res, next) => {
  const apiUuid = crypto.randomUUID();
  req.apiUuid = apiUuid;
  const timestamp = /* @__PURE__ */ new Date();
  res.on("finish", async () => {
    try {
      const authorUuid = req.user?.uuid || req.user?.id || null;
      const username = req.user?.username || "anonymous";
      const action = `${req.method} ${req.originalUrl || req.url}`;
      const details = `API Request processed with HTTP status code ${res.statusCode}`;
      await MongoActivityLog.create({
        uuid: crypto.randomUUID(),
        apiUuid,
        authorUuid,
        action,
        status: "active",
        timestamp,
        details,
        user: username
      });
    } catch {
    }
  });
  next();
});
var JWT_SECRET = process.env.JWT_SECRET || "shree_bhairavnath_secret_key";
var isServerless2 = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
var uploadsDir = isServerless2 ? path2.join("/tmp", "uploads") : path2.join(process.cwd(), "uploads");
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  console.warn("Upload directory check skipped:", e);
}
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path2.extname(file.originalname));
  }
});
var upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path2.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only images (jpeg, jpg, png, gif) and PDFs are allowed"));
  }
});
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No authentication token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired authentication token" });
  }
}
function authorize(permission, requireSuperAdmin = false) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    if (req.user.role === "super_admin") {
      return next();
    }
    if (requireSuperAdmin) {
      return res.status(403).json({ message: "Access forbidden: Super Admin only" });
    }
    if (req.user.role === "trustee") {
      const url = req.baseUrl || req.originalUrl || req.url || "";
      let moduleName = "";
      if (url.includes("/receipts")) {
        moduleName = "receipts";
      } else if (url.includes("/expenses")) {
        moduleName = "expenses";
      } else if (url.includes("/yearly_events")) {
        moduleName = "yearly_events";
      } else if (url.includes("/monthly_events")) {
        moduleName = "monthly_events";
      } else if (url.includes("/banners")) {
        moduleName = "banners";
      }
      if (!moduleName) {
        return next();
      }
      const trusteePerms = req.user.trusteePermissions || {};
      const modPerm = trusteePerms[moduleName];
      if (!modPerm) {
        return res.status(403).json({ message: `Access forbidden: No permissions for ${moduleName}` });
      }
      if (permission) {
        if (permission === "read" && !modPerm.read) {
          return res.status(403).json({ message: `Access forbidden: Missing read permission for ${moduleName}` });
        }
        if (permission === "write" && !modPerm.write) {
          return res.status(403).json({ message: `Access forbidden: Missing write permission for ${moduleName}` });
        }
        if (permission === "update" && !modPerm.update) {
          return res.status(403).json({ message: `Access forbidden: Missing update permission for ${moduleName}` });
        }
        if (permission === "delete") {
          return res.status(403).json({ message: `Access forbidden: Trustees cannot delete records` });
        }
      }
      return next();
    }
    if (permission) {
      const userPermissions = (req.user.permissions || "").split(",");
      if (!userPermissions.includes(permission)) {
        return res.status(403).json({ message: `Access forbidden: Missing ${permission} permission` });
      }
    }
    next();
  };
}
async function logActivity(action, details, user, authorUuid) {
  try {
    await MongoActivityLog.create({
      uuid: crypto.randomUUID(),
      action,
      details,
      user,
      status: "active",
      authorUuid: authorUuid || null,
      timestamp: /* @__PURE__ */ new Date()
    });
  } catch {
  }
}
apiRouter.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file was uploaded" });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename });
});
apiRouter.post("/translate", async (req, res) => {
  const { texts } = req.body;
  if (!Array.isArray(texts)) {
    return res.status(400).json({ message: "Request body must contain 'texts' array" });
  }
  try {
    const translations = await translateTextsToMarathi(texts);
    res.json({ translations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
var PAYLOAD_SECRET_KEY = "shree_bhairavnath_secret_key_32b";
function decryptPayloadPassword(rawPassword) {
  if (!rawPassword || typeof rawPassword !== "string" || !rawPassword.startsWith("ENC:")) {
    return rawPassword;
  }
  try {
    const parts = rawPassword.split(":");
    if (parts.length !== 3) return rawPassword;
    const iv = Buffer.from(parts[1], "hex");
    const ciphertext = Buffer.from(parts[2], "hex");
    const key = Buffer.from(PAYLOAD_SECRET_KEY, "utf-8");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(ciphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString("utf-8");
  } catch (err) {
    console.error("Failed to decrypt payload password:", err);
    return rawPassword;
  }
}
apiRouter.post("/login", async (req, res) => {
  const { username, password: rawPassword } = req.body;
  if (!username || !rawPassword) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  const password = decryptPayloadPassword(rawPassword);
  try {
    const user = await MongoUser.findOne({ username, status: "active" });
    if (!user) {
      const trustee = await MongoTrustee.findOne({ username, status: "active" });
      if (trustee) {
        const isMatch2 = await bcrypt2.compare(password, trustee.passwordHash);
        if (!isMatch2) {
          return res.status(401).json({ message: "Invalid password" });
        }
        const rawPerms = await MongoTrusteePermission.find({ trusteeUuid: trustee.uuid, status: "active" });
        const trusteePerms = {};
        ["receipts", "expenses", "yearly_events", "monthly_events", "banners"].forEach((m) => {
          trusteePerms[m] = { read: false, write: false, update: false };
        });
        rawPerms.forEach((p) => {
          trusteePerms[p.moduleName] = {
            read: !!p.canRead,
            write: !!p.canWrite,
            update: !!p.canUpdate
          };
        });
        const token2 = jwt.sign(
          {
            id: trustee.uuid,
            uuid: trustee.uuid,
            username: trustee.username,
            role: "trustee",
            name: trustee.fullName,
            trusteePermissions: trusteePerms
          },
          JWT_SECRET,
          { expiresIn: "8h" }
        );
        await logActivity("TRUSTEE_LOGIN", `Trustee ${trustee.fullName} logged in successfully`, trustee.username);
        return res.json({
          token: token2,
          user: {
            id: trustee.uuid,
            uuid: trustee.uuid,
            name: trustee.fullName,
            username: trustee.username,
            email: trustee.email,
            role: "trustee",
            status: trustee.status,
            designation: trustee.designation,
            profilePhoto: trustee.profilePhoto,
            mobile: trustee.mobile,
            trusteePermissions: trusteePerms
          }
        });
      }
      return res.status(401).json({ message: "Invalid username or inactive account" });
    }
    const isMatch = await bcrypt2.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = jwt.sign(
      {
        id: user.uuid,
        uuid: user.uuid,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );
    await logActivity("USER_LOGIN", `${user.name} logged in successfully`, user.username);
    res.json({
      token,
      user: {
        id: user.uuid,
        uuid: user.uuid,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.post("/logout", authenticate, async (req, res) => {
  await logActivity("USER_LOGOUT", `${req.user.name} logged out`, req.user.username);
  res.json({ message: "Successfully logged out" });
});
apiRouter.get("/users", authenticate, authorize("", true), async (req, res) => {
  try {
    const users = await MongoUser.find({ status: "active" }, "-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.post("/users", authenticate, authorize("", true), async (req, res) => {
  const { name, username, password, email, role, status, permissions } = req.body;
  if (!name || !username || !password || !email) {
    return res.status(400).json({ message: "All user fields are required" });
  }
  try {
    const existing = await MongoUser.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const hashedPassword = await bcrypt2.hash(password, 10);
    const defaultPerms = role === "super_admin" ? "read,write,update,delete" : permissions || "read,write,update";
    const newUser = await MongoUser.create({
      uuid: crypto.randomUUID(),
      name,
      username,
      password: hashedPassword,
      email,
      role: role || "user",
      status: status || "active",
      permissions: defaultPerms,
      authorUuid: req.user.uuid || null
    });
    await logActivity("USER_CREATED", `Created user ${name} (${username})`, req.user.username);
    const responseUser = newUser.toJSON();
    delete responseUser.password;
    res.status(201).json(responseUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.put("/users/:id", authenticate, authorize("", true), async (req, res) => {
  const { name, email, role, status, permissions, password } = req.body;
  try {
    const user = await MongoUser.findOne({ uuid: req.params.id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (status) user.status = status;
    if (permissions) user.permissions = permissions;
    if (password) {
      user.password = await bcrypt2.hash(password, 10);
    }
    user.authorUuid = req.user.uuid || null;
    await user.save();
    await logActivity("USER_UPDATED", `Updated user ${user.name} (${user.username})`, req.user.username);
    const responseUser = user.toJSON();
    delete responseUser.password;
    res.json(responseUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.delete("/users/:id", authenticate, authorize("", true), async (req, res) => {
  try {
    const user = await MongoUser.findOne({ uuid: req.params.id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.username === "admin") {
      return res.status(400).json({ message: "Cannot deactivate the default Super Admin account" });
    }
    user.status = "inactive";
    await user.save();
    await logActivity("USER_DELETED", `Deactivated user ${user.name} (${user.username})`, req.user.username);
    res.json({ message: "User successfully deactivated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.get("/receipts", async (req, res) => {
  const { search, reason, dateFrom, dateTo, page = "1", limit = "10" } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;
  const whereClause = { status: "active" };
  if (search) {
    const searchRegex = new RegExp(search, "i");
    whereClause.$or = [
      { name: searchRegex },
      { receiptNo: searchRegex },
      { foodName: searchRegex }
    ];
  }
  if (reason) {
    whereClause.reason = reason;
  }
  if (dateFrom && dateTo) {
    whereClause.createdDate = { $gte: dateFrom, $lte: dateTo };
  } else if (dateFrom) {
    whereClause.createdDate = { $gte: dateFrom };
  } else if (dateTo) {
    whereClause.createdDate = { $lte: dateTo };
  }
  try {
    const count = await MongoReceipt.countDocuments(whereClause);
    const rows = await MongoReceipt.find(whereClause).sort({ createdDate: -1, createdAt: -1 }).skip(skip).limit(limitNum);
    res.json({
      data: rows,
      total: count,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.get("/receipts/:id", async (req, res) => {
  try {
    const receipt = await MongoReceipt.findOne({ uuid: req.params.id });
    if (!receipt || receipt.status === "inactive") {
      return res.status(404).json({ message: "Receipt not found" });
    }
    res.json(receipt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.post("/receipts", authenticate, authorize("write"), async (req, res) => {
  const { name, reason, amount, foodName, foodQty, image, createdDate, mobile, address, paymentMode } = req.body;
  if (!name || !reason || !image || !createdDate || !mobile) {
    return res.status(400).json({ message: "Name, Reason, Date, Image and Phone Number are required" });
  }
  try {
    const totalReceipts = await MongoReceipt.countDocuments({ status: "active" });
    const receiptNo = `REC-${1e3 + totalReceipts + 1}`;
    const receipt = await MongoReceipt.create({
      uuid: crypto.randomUUID(),
      receiptNo,
      name,
      reason,
      amount: reason === "Food" ? null : amount,
      foodName: reason === "Food" ? foodName : null,
      foodQty: reason === "Food" ? foodQty : null,
      image,
      createdDate,
      createdBy: req.user.username,
      status: "active",
      authorUuid: req.user.uuid || null,
      mobile,
      address: address || null,
      paymentMode: paymentMode || "Cash"
    });
    await logActivity("RECEIPT_CREATED", `Created receipt ${receiptNo} for ${name}`, req.user.username);
    res.status(201).json(receipt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.put("/receipts/:id", authenticate, authorize("update"), async (req, res) => {
  const { name, reason, amount, foodName, foodQty, image, createdDate, mobile, address, paymentMode } = req.body;
  try {
    const receipt = await MongoReceipt.findOne({ uuid: req.params.id });
    if (!receipt || receipt.status === "inactive") {
      return res.status(404).json({ message: "Receipt not found" });
    }
    receipt.status = "inactive";
    await receipt.save();
    const newReceipt = await MongoReceipt.create({
      uuid: crypto.randomUUID(),
      receiptNo: receipt.receiptNo,
      // Keep the same receipt number
      name: name !== void 0 ? name : receipt.name,
      reason: reason !== void 0 ? reason : receipt.reason,
      amount: reason === "Food" ? null : amount !== void 0 ? amount : receipt.amount,
      foodName: reason === "Food" ? foodName !== void 0 ? foodName : receipt.foodName : null,
      foodQty: reason === "Food" ? foodQty !== void 0 ? foodQty : receipt.foodQty : null,
      image: image !== void 0 ? image : receipt.image,
      createdDate: createdDate !== void 0 ? createdDate : receipt.createdDate,
      createdBy: receipt.createdBy,
      status: "active",
      authorUuid: req.user.uuid || null,
      mobile: mobile !== void 0 ? mobile : receipt.mobile,
      address: address !== void 0 ? address : receipt.address,
      paymentMode: paymentMode !== void 0 ? paymentMode : receipt.paymentMode || "Cash"
    });
    await logActivity("RECEIPT_UPDATED", `Updated receipt ${receipt.receiptNo} for ${receipt.name} (New version: ${newReceipt.uuid})`, req.user.username);
    res.json(newReceipt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.delete("/receipts/:id", authenticate, authorize("delete"), async (req, res) => {
  try {
    const receipt = await MongoReceipt.findOne({ uuid: req.params.id });
    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }
    receipt.status = "inactive";
    await receipt.save();
    await logActivity("RECEIPT_DELETED", `Deactivated receipt ${receipt.receiptNo} of ${receipt.name}`, req.user.username);
    res.json({ message: "Receipt deactivated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.get("/yearly_events", async (req, res) => {
  try {
    const events = await MongoYearlyEvent.find({ status: "active" }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.post("/yearly_events", authenticate, authorize("write"), async (req, res) => {
  const { title, description, date, image, location, status } = req.body;
  if (!title || !description || !date || !image || !location) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const event = await MongoYearlyEvent.create({
      uuid: crypto.randomUUID(),
      title,
      description,
      date,
      image,
      location,
      eventStatus: status || "upcoming",
      status: "active",
      authorUuid: req.user.uuid || null
    });
    await logActivity("YEARLY_EVENT_CREATED", `Created yearly event: ${title}`, req.user.username);
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.put("/yearly_events/:id", authenticate, authorize("update"), async (req, res) => {
  const { title, description, date, image, location, status } = req.body;
  try {
    const event = await MongoYearlyEvent.findOne({ uuid: req.params.id });
    if (!event || event.status === "inactive") return res.status(404).json({ message: "Event not found" });
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (image) event.image = image;
    if (location) event.location = location;
    if (status) event.eventStatus = status;
    event.authorUuid = req.user.uuid || null;
    await event.save();
    await logActivity("YEARLY_EVENT_UPDATED", `Updated yearly event: ${event.title}`, req.user.username);
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.delete("/yearly_events/:id", authenticate, authorize("delete"), async (req, res) => {
  try {
    const event = await MongoYearlyEvent.findOne({ uuid: req.params.id });
    if (!event) return res.status(404).json({ message: "Event not found" });
    event.status = "inactive";
    await event.save();
    await logActivity("YEARLY_EVENT_DELETED", `Deactivated yearly event: ${event.title}`, req.user.username);
    res.json({ message: "Event deactivated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.get("/monthly_events", async (req, res) => {
  try {
    const events = await MongoMonthlyEvent.find({ status: "active" }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.post("/monthly_events", authenticate, authorize("write"), async (req, res) => {
  const { title, description, date, image, location, status } = req.body;
  if (!title || !description || !date || !image || !location) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const event = await MongoMonthlyEvent.create({
      uuid: crypto.randomUUID(),
      title,
      description,
      date,
      image,
      location,
      eventStatus: status || "upcoming",
      status: "active",
      authorUuid: req.user.uuid || null
    });
    await logActivity("MONTHLY_EVENT_CREATED", `Created monthly event: ${title}`, req.user.username);
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.put("/monthly_events/:id", authenticate, authorize("update"), async (req, res) => {
  const { title, description, date, image, location, status } = req.body;
  try {
    const event = await MongoMonthlyEvent.findOne({ uuid: req.params.id });
    if (!event || event.status === "inactive") return res.status(404).json({ message: "Event not found" });
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (image) event.image = image;
    if (location) event.location = location;
    if (status) event.eventStatus = status;
    event.authorUuid = req.user.uuid || null;
    await event.save();
    await logActivity("MONTHLY_EVENT_UPDATED", `Updated monthly event: ${event.title}`, req.user.username);
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.delete("/monthly_events/:id", authenticate, authorize("delete"), async (req, res) => {
  try {
    const event = await MongoMonthlyEvent.findOne({ uuid: req.params.id });
    if (!event) return res.status(404).json({ message: "Event not found" });
    event.status = "inactive";
    await event.save();
    await logActivity("MONTHLY_EVENT_DELETED", `Deactivated monthly event: ${event.title}`, req.user.username);
    res.json({ message: "Event deactivated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.get("/expenses", async (req, res) => {
  const { search, category, page = "1", limit = "10" } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;
  const whereClause = { status: "active" };
  if (search) {
    const searchRegex = new RegExp(search, "i");
    whereClause.$or = [
      { name: searchRegex },
      { description: searchRegex }
    ];
  }
  if (category) {
    whereClause.category = category;
  }
  try {
    const count = await MongoExpense.countDocuments(whereClause);
    const rows = await MongoExpense.find(whereClause).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limitNum);
    res.json({
      data: rows,
      total: count,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.post("/expenses", authenticate, authorize("write"), async (req, res) => {
  const { name, category, amount, description, date, bill, paymentMode } = req.body;
  if (!name || !category || !amount || !date || !bill) {
    return res.status(400).json({ message: "Name, Category, Amount, Date and Bill are required" });
  }
  try {
    const expense = await MongoExpense.create({
      uuid: crypto.randomUUID(),
      name,
      category,
      amount,
      description,
      date,
      bill,
      createdBy: req.user.username,
      status: "active",
      authorUuid: req.user.uuid || null,
      paymentMode: paymentMode || "Cash"
    });
    await logActivity("EXPENSE_CREATED", `Created expense: ${name} (Rs. ${amount})`, req.user.username);
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.put("/expenses/:id", authenticate, authorize("update"), async (req, res) => {
  const { name, category, amount, description, date, bill, paymentMode } = req.body;
  try {
    const expense = await MongoExpense.findOne({ uuid: req.params.id });
    if (!expense || expense.status === "inactive") return res.status(404).json({ message: "Expense not found" });
    expense.status = "inactive";
    await expense.save();
    const newExpense = await MongoExpense.create({
      uuid: crypto.randomUUID(),
      name: name !== void 0 ? name : expense.name,
      category: category !== void 0 ? category : expense.category,
      amount: amount !== void 0 ? amount : expense.amount,
      description: description !== void 0 ? description : expense.description,
      date: date !== void 0 ? date : expense.date,
      bill: bill !== void 0 ? bill : expense.bill,
      createdBy: expense.createdBy,
      status: "active",
      authorUuid: req.user.uuid || null,
      paymentMode: paymentMode !== void 0 ? paymentMode : expense.paymentMode || "Cash"
    });
    await logActivity("EXPENSE_UPDATED", `Updated expense: ${expense.name} (New version: ${newExpense.uuid})`, req.user.username);
    res.json(newExpense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.delete("/expenses/:id", authenticate, authorize("delete"), async (req, res) => {
  try {
    const expense = await MongoExpense.findOne({ uuid: req.params.id });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    expense.status = "inactive";
    await expense.save();
    await logActivity("EXPENSE_DELETED", `Deactivated expense: ${expense.name}`, req.user.username);
    res.json({ message: "Expense deactivated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.get("/banners", async (req, res) => {
  try {
    const banners = await MongoBanner.find({
      status: "active",
      active: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: /* @__PURE__ */ new Date() } }
      ]
    });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.get("/banners/all", authenticate, authorize("", false), async (req, res) => {
  try {
    const banners = await MongoBanner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.post("/banners", authenticate, authorize("", false), async (req, res) => {
  const { title, image, description, color, fontStyle, expiresAt, active } = req.body;
  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }
  if (!image && !description) {
    return res.status(400).json({ message: "Either Image or Description is required" });
  }
  try {
    const banner = await MongoBanner.create({
      uuid: crypto.randomUUID(),
      title,
      image: image || null,
      description: description || null,
      color: color || null,
      fontStyle: fontStyle || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      active: active !== void 0 ? active : true,
      status: "active",
      authorUuid: req.user.uuid || null
    });
    await logActivity("BANNER_CREATED", `Created banner: ${title}`, req.user.username);
    res.status(201).json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.delete("/banners/:id", authenticate, authorize("", false), async (req, res) => {
  try {
    const banner = await MongoBanner.findOne({ uuid: req.params.id });
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    banner.status = "inactive";
    banner.active = false;
    await banner.save();
    await logActivity("BANNER_DELETED", `Deactivated banner: ${banner.title}`, req.user.username);
    res.json({ message: "Banner deactivated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.get("/slider_images", async (req, res) => {
  try {
    const sliderImages = await MongoSliderImage.find({ status: "active" });
    res.json(sliderImages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.post("/slider_images", authenticate, authorize("", true), async (req, res) => {
  const { image, title, active } = req.body;
  if (!image || !title) {
    return res.status(400).json({ message: "Image and Title are required" });
  }
  try {
    const sliderImg = await MongoSliderImage.create({
      uuid: crypto.randomUUID(),
      image,
      title,
      active: active !== void 0 ? active : true,
      status: "active",
      authorUuid: req.user.uuid || null
    });
    await logActivity("SLIDER_IMAGE_CREATED", `Created slider image: ${title}`, req.user.username);
    res.status(201).json(sliderImg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.delete("/slider_images/:id", authenticate, authorize("", true), async (req, res) => {
  try {
    const sliderImg = await MongoSliderImage.findOne({ uuid: req.params.id });
    if (!sliderImg) return res.status(404).json({ message: "Slider image not found" });
    sliderImg.status = "inactive";
    await sliderImg.save();
    await logActivity("SLIDER_IMAGE_DELETED", `Deactivated slider image: ${sliderImg.title}`, req.user.username);
    res.json({ message: "Slider image deactivated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.get("/dashboard/summary", async (req, res) => {
  try {
    const receipts = await MongoReceipt.find({ status: "active" }, "amount");
    const totalReceipts = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
    const expenses = await MongoExpense.find({ status: "active" }, "amount");
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const yearlyUpcomingCount = await MongoYearlyEvent.countDocuments({ status: "active", eventStatus: "upcoming" });
    const monthlyUpcomingCount = await MongoMonthlyEvent.countDocuments({ status: "active", eventStatus: "upcoming" });
    const upcomingEvents = yearlyUpcomingCount + monthlyUpcomingCount;
    const yearlyEvents = await MongoYearlyEvent.countDocuments({ status: "active" });
    const monthlyEvents = await MongoMonthlyEvent.countDocuments({ status: "active" });
    const recentActivities = await MongoActivityLog.find({ status: "active" }).sort({ timestamp: -1 }).limit(8);
    res.json({
      totalReceipts,
      totalExpenses,
      upcomingEvents,
      yearlyEvents,
      monthlyEvents,
      recentActivities
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
function blockTrustees(req, res, next) {
  if (req.user && req.user.role === "trustee") {
    return res.status(403).json({ message: "Access forbidden: Trustees cannot manage trustee accounts" });
  }
  next();
}
apiRouter.get("/trustees", authenticate, blockTrustees, async (req, res) => {
  try {
    const trustees = await MongoTrustee.find({ status: "active" }).sort({ createdAt: -1 });
    const trusteeList = await Promise.all(
      trustees.map(async (t) => {
        const perms = await MongoTrusteePermission.find({ trusteeUuid: t.uuid, status: "active" });
        const obj = t.toJSON();
        obj.permissions = perms;
        return obj;
      })
    );
    res.json(trusteeList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.get("/trustees/:id", authenticate, blockTrustees, async (req, res) => {
  try {
    const trustee = await MongoTrustee.findOne({ uuid: req.params.id });
    if (!trustee || trustee.status === "inactive") {
      return res.status(404).json({ message: "Trustee not found" });
    }
    const perms = await MongoTrusteePermission.find({ trusteeUuid: trustee.uuid, status: "active" });
    const obj = trustee.toJSON();
    obj.permissions = perms;
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.post("/trustees", authenticate, blockTrustees, async (req, res) => {
  const { fullName, username, password, mobile, email, designation, profilePhoto, status, permissions } = req.body;
  if (!fullName || !username || !password) {
    return res.status(400).json({ message: "Full Name, Username, and Password are required" });
  }
  try {
    const existing = await MongoTrustee.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const passwordHash = await bcrypt2.hash(password, 10);
    const trusteeUuid = crypto.randomUUID();
    const trustee = await MongoTrustee.create({
      uuid: trusteeUuid,
      fullName,
      username,
      passwordHash,
      mobile: mobile || null,
      email: email || null,
      designation: designation || null,
      profilePhoto: profilePhoto || null,
      status: status || "active",
      authorUuid: req.user.uuid || null
    });
    const modules = ["receipts", "expenses", "yearly_events", "monthly_events", "banners"];
    const permsToCreate = modules.map((mod) => {
      const modulePerm = (permissions || {})[mod] || {};
      return {
        uuid: crypto.randomUUID(),
        trusteeUuid: trustee.uuid,
        moduleName: mod,
        canRead: !!modulePerm.read,
        canWrite: !!modulePerm.write,
        canUpdate: !!modulePerm.update,
        status: "active",
        authorUuid: req.user.uuid || null
      };
    });
    const perms = await MongoTrusteePermission.insertMany(permsToCreate);
    await logActivity("TRUSTEE_CREATED", `Created trustee account for ${fullName} (${username})`, req.user.username);
    const createdObj = trustee.toJSON();
    createdObj.permissions = perms;
    res.status(201).json(createdObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.put("/trustees/:id", authenticate, blockTrustees, async (req, res) => {
  const { fullName, mobile, email, designation, profilePhoto, status, permissions } = req.body;
  try {
    const trustee = await MongoTrustee.findOne({ uuid: req.params.id });
    if (!trustee || trustee.status === "inactive") {
      return res.status(404).json({ message: "Trustee not found" });
    }
    if (fullName) trustee.fullName = fullName;
    if (mobile !== void 0) trustee.mobile = mobile;
    if (email !== void 0) trustee.email = email;
    if (designation !== void 0) trustee.designation = designation;
    if (profilePhoto !== void 0) trustee.profilePhoto = profilePhoto;
    if (status) trustee.status = status;
    trustee.authorUuid = req.user.uuid || null;
    await trustee.save();
    if (permissions) {
      await MongoTrusteePermission.deleteMany({ trusteeUuid: trustee.uuid });
      const modules = ["receipts", "expenses", "yearly_events", "monthly_events", "banners"];
      const permsToCreate = modules.map((mod) => {
        const modulePerm = permissions[mod] || {};
        return {
          uuid: crypto.randomUUID(),
          trusteeUuid: trustee.uuid,
          moduleName: mod,
          canRead: !!modulePerm.read,
          canWrite: !!modulePerm.write,
          canUpdate: !!modulePerm.update,
          status: "active",
          authorUuid: req.user.uuid || null
        };
      });
      await MongoTrusteePermission.insertMany(permsToCreate);
    }
    await logActivity("TRUSTEE_UPDATED", `Updated trustee account for ${trustee.fullName}`, req.user.username);
    const perms = await MongoTrusteePermission.find({ trusteeUuid: trustee.uuid, status: "active" });
    const updatedObj = trustee.toJSON();
    updatedObj.permissions = perms;
    res.json(updatedObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.patch("/trustees/:id/status", authenticate, blockTrustees, async (req, res) => {
  const { status } = req.body;
  if (!status || status !== "active" && status !== "inactive") {
    return res.status(400).json({ message: "Valid status ('active' or 'inactive') is required" });
  }
  try {
    const trustee = await MongoTrustee.findOne({ uuid: req.params.id });
    if (!trustee || trustee.status === "inactive") {
      return res.status(404).json({ message: "Trustee not found" });
    }
    trustee.status = status;
    trustee.authorUuid = req.user.uuid || null;
    await trustee.save();
    await logActivity("TRUSTEE_STATUS_CHANGED", `Changed trustee ${trustee.fullName} status to ${status}`, req.user.username);
    res.json(trustee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.patch("/trustees/:id/reset-password", authenticate, blockTrustees, async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }
  try {
    const trustee = await MongoTrustee.findOne({ uuid: req.params.id });
    if (!trustee || trustee.status === "inactive") {
      return res.status(404).json({ message: "Trustee not found" });
    }
    trustee.passwordHash = await bcrypt2.hash(password, 10);
    trustee.authorUuid = req.user.uuid || null;
    await trustee.save();
    await logActivity("TRUSTEE_PASSWORD_RESET", `Reset password for trustee ${trustee.fullName}`, req.user.username);
    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
apiRouter.delete("/trustees/:id", authenticate, blockTrustees, async (req, res) => {
  try {
    const trustee = await MongoTrustee.findOne({ uuid: req.params.id });
    if (!trustee) {
      return res.status(404).json({ message: "Trustee not found" });
    }
    trustee.status = "inactive";
    trustee.authorUuid = req.user.uuid || null;
    await trustee.save();
    await logActivity("TRUSTEE_DELETED", `Deactivated trustee ${trustee.fullName}`, req.user.username);
    res.json({ message: "Trustee successfully deactivated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
var getBoardMembersHandler = async (req, res) => {
  try {
    const members = await MongoBoardMember.find({ status: "active" }).sort({ displayOrder: 1, createdAt: 1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
apiRouter.get("/board_members", getBoardMembersHandler);
apiRouter.get("/board-members", getBoardMembersHandler);
var postBoardMembersHandler = async (req, res) => {
  const { name, designation, profilePhoto, displayOrder } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Member name is required" });
  }
  try {
    const member = await MongoBoardMember.create({
      uuid: crypto.randomUUID(),
      name: name.trim(),
      designation: designation?.trim() || null,
      profilePhoto: profilePhoto || null,
      displayOrder: displayOrder !== void 0 ? Number(displayOrder) : 0,
      status: "active",
      authorUuid: req.user.uuid || null
    });
    await logActivity("BOARD_MEMBER_CREATED", `Added board member: ${name}`, req.user.username);
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
apiRouter.post("/board_members", authenticate, authorize("write"), postBoardMembersHandler);
apiRouter.post("/board-members", authenticate, authorize("write"), postBoardMembersHandler);
var putBoardMembersHandler = async (req, res) => {
  const { name, designation, profilePhoto, displayOrder } = req.body;
  try {
    const query = {
      $or: [
        { uuid: req.params.id },
        ...mongoose3.isValidObjectId(req.params.id) ? [{ _id: req.params.id }] : []
      ]
    };
    const member = await MongoBoardMember.findOne(query);
    if (!member || member.status === "inactive") {
      return res.status(404).json({ message: "Board member not found" });
    }
    if (name) member.name = name.trim();
    if (designation !== void 0) member.designation = designation?.trim() || null;
    if (profilePhoto !== void 0) member.profilePhoto = profilePhoto || null;
    if (displayOrder !== void 0) member.displayOrder = Number(displayOrder);
    member.authorUuid = req.user.uuid || null;
    await member.save();
    await logActivity("BOARD_MEMBER_UPDATED", `Updated board member: ${member.name}`, req.user.username);
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
apiRouter.put("/board_members/:id", authenticate, authorize("update"), putBoardMembersHandler);
apiRouter.put("/board-members/:id", authenticate, authorize("update"), putBoardMembersHandler);
var deleteBoardMembersHandler = async (req, res) => {
  try {
    const query = {
      $or: [
        { uuid: req.params.id },
        ...mongoose3.isValidObjectId(req.params.id) ? [{ _id: req.params.id }] : []
      ]
    };
    const member = await MongoBoardMember.findOne(query);
    if (!member) {
      return res.status(404).json({ message: "Board member not found" });
    }
    const memberName = member.name;
    const memberPhoto = member.profilePhoto;
    await MongoBoardMember.deleteOne({ _id: member._id });
    if (memberPhoto && memberPhoto.startsWith("/uploads/")) {
      const filePath = path2.join(process.cwd(), memberPhoto);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
        }
      }
    }
    await logActivity("BOARD_MEMBER_DELETED", `Permanently removed board member: ${memberName}`, req.user?.username || "admin");
    res.json({ message: "Board member removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
apiRouter.delete("/board_members/:id", authenticate, authorize("delete"), deleteBoardMembersHandler);
apiRouter.delete("/board-members/:id", authenticate, authorize("delete"), deleteBoardMembersHandler);

// server/serverless.ts
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(async (req, res, next) => {
  try {
    await initDatabase();
  } catch (err) {
    console.error("Database initialization failed in serverless function:", err);
  }
  next();
});
app.use("/api", apiRouter);
app.use(apiRouter);
var serverless_default = app;
export {
  serverless_default as default
};
