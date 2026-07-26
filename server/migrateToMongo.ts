import "dotenv/config";
import mongoose from "mongoose";
import {
  initDatabase,
  User,
  Receipt,
  Expense,
  YearlyEvent,
  MonthlyEvent,
  Banner,
  SliderImage,
  ActivityLog,
  Trustee,
  TrusteePermission,
  BoardMember,
} from "./db";
import {
  MongoUser,
  MongoReceipt,
  MongoExpense,
  MongoYearlyEvent,
  MongoMonthlyEvent,
  MongoBanner,
  MongoSliderImage,
  MongoActivityLog,
  MongoTrustee,
  MongoTrusteePermission,
  MongoBoardMember,
} from "./mongoModels";

async function migrate() {
  console.log("=== Starting Database Migration to MongoDB ===");

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("Error: MONGODB_URI is not defined in .env file.");
    process.exit(1);
  }

  if (mongoUri.includes("<db_password>")) {
    console.error(
      "Error: MONGODB_URI contains '<db_password>' placeholder. Please replace <db_password> with your actual MongoDB password in .env before running migration."
    );
    process.exit(1);
  }

  try {
    // 1. Initialize local SQL DB
    console.log("Initializing local SQL database...");
    await initDatabase();

    // 2. Connect to MongoDB Atlas
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB Atlas successfully!");

    // Helper for upsert migration
    const migrateCollection = async (
      name: string,
      SqlModel: any,
      MongoModel: any
    ) => {
      const records = await SqlModel.findAll();
      console.log(`Migrating ${records.length} records for ${name}...`);
      let successCount = 0;
      for (const rec of records) {
        const data = rec.toJSON();
        // Remove numeric sqlite id if present, use uuid
        delete data.id;
        await MongoModel.findOneAndUpdate({ uuid: data.uuid }, data, {
          upsert: true,
          new: true,
        });
        successCount++;
      }
      console.log(`✓ ${name}: Migrated ${successCount}/${records.length} records.`);
    };

    // Migrate each table
    await migrateCollection("Users", User, MongoUser);
    await migrateCollection("Receipts", Receipt, MongoReceipt);
    await migrateCollection("Expenses", Expense, MongoExpense);
    await migrateCollection("Yearly Events", YearlyEvent, MongoYearlyEvent);
    await migrateCollection("Monthly Events", MonthlyEvent, MongoMonthlyEvent);
    await migrateCollection("Banners", Banner, MongoBanner);
    await migrateCollection("Slider Images", SliderImage, MongoSliderImage);
    await migrateCollection("Activity Logs", ActivityLog, MongoActivityLog);
    await migrateCollection("Trustees", Trustee, MongoTrustee);
    await migrateCollection(
      "Trustee Permissions",
      TrusteePermission,
      MongoTrusteePermission
    );
    await migrateCollection("Board Members", BoardMember, MongoBoardMember);

    console.log("\n=============================================");
    console.log("🎉 Database Migration to MongoDB Completed!");
    console.log("=============================================");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed with error:", error);
    process.exit(1);
  }
}

migrate();
