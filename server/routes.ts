import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
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
import { responseTranslationMiddleware, translateTextsToMarathi } from "./translationMiddleware";

export const apiRouter = Router();

// Mount automatic Marathi response translation middleware
apiRouter.use(responseTranslationMiddleware);

// Middleware to automatically log every API call to the audit/activity logs
apiRouter.use((req: any, res: Response, next: () => void) => {
  const apiUuid = crypto.randomUUID();
  req.apiUuid = apiUuid;
  const timestamp = new Date();

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
        user: username,
      });
    } catch {
      // Ignore logging failure
    }
  });

  next();
});

const JWT_SECRET = process.env.JWT_SECRET || "shree_bhairavnath_secret_key";

// --- Multer File Upload Setup ---
const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const uploadsDir = isServerless ? path.join("/tmp", "uploads") : path.join(process.cwd(), "uploads");
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  console.warn("Upload directory check skipped:", e);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only images (jpeg, jpg, png, gif) and PDFs are allowed"));
  },
});

// --- Helper Middlewares ---
export function authenticate(req: any, res: Response, next: () => void) {
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

export function authorize(permission?: string, requireSuperAdmin = false) {
  return (req: any, res: Response, next: () => void) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    if (req.user.role === "super_admin") {
      return next(); // Super Admin can perform any action
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

// Log Activity utility
async function logActivity(action: string, details: string, user: string, authorUuid?: string | null) {
  try {
    await MongoActivityLog.create({
      uuid: crypto.randomUUID(),
      action,
      details,
      user,
      status: "active",
      authorUuid: authorUuid || null,
      timestamp: new Date(),
    });
  } catch {
    // Ignore logging failure
  }
}

// --- Upload Route ---
apiRouter.post("/upload", upload.single("file"), (req: any, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file was uploaded" });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.filename });
});

// --- Translation Route ---
apiRouter.post("/translate", async (req: Request, res: Response) => {
  const { texts } = req.body;
  if (!Array.isArray(texts)) {
    return res.status(400).json({ message: "Request body must contain 'texts' array" });
  }
  try {
    const translations = await translateTextsToMarathi(texts);
    res.json({ translations });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

const PAYLOAD_SECRET_KEY = "shree_bhairavnath_secret_key_32b";

function decryptPayloadPassword(rawPassword: string): string {
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

// --- Auth Endpoints ---
apiRouter.post("/login", async (req: Request, res: Response) => {
  const { username, password: rawPassword } = req.body;
  if (!username || !rawPassword) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const password = decryptPayloadPassword(rawPassword);

  try {
    const user = await MongoUser.findOne({ username, status: "active" });
    if (!user) {
      // Check if there is a trustee with this username
      const trustee = await MongoTrustee.findOne({ username, status: "active" });

      if (trustee) {
        const isMatch = await bcrypt.compare(password, trustee.passwordHash);
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid password" });
        }

        const rawPerms = await MongoTrusteePermission.find({ trusteeUuid: trustee.uuid, status: "active" });

        // Process permissions into a handy object
        const trusteePerms: any = {};
        ["receipts", "expenses", "yearly_events", "monthly_events", "banners"].forEach((m) => {
          trusteePerms[m] = { read: false, write: false, update: false };
        });
        rawPerms.forEach((p: any) => {
          trusteePerms[p.moduleName] = {
            read: !!p.canRead,
            write: !!p.canWrite,
            update: !!p.canUpdate,
          };
        });

        const token = jwt.sign(
          {
            id: trustee.uuid,
            uuid: trustee.uuid,
            username: trustee.username,
            role: "trustee",
            name: trustee.fullName,
            trusteePermissions: trusteePerms,
          },
          JWT_SECRET,
          { expiresIn: "8h" }
        );

        await logActivity("TRUSTEE_LOGIN", `Trustee ${trustee.fullName} logged in successfully`, trustee.username);

        return res.json({
          token,
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
            trusteePermissions: trusteePerms,
          },
        });
      }

      return res.status(401).json({ message: "Invalid username or inactive account" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.uuid,
        uuid: user.uuid,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
        name: user.name,
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
        permissions: user.permissions,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.post("/logout", authenticate, async (req: any, res: Response) => {
  await logActivity("USER_LOGOUT", `${req.user.name} logged out`, req.user.username);
  res.json({ message: "Successfully logged out" });
});

// --- Users (Super Admin Only) ---
apiRouter.get("/users", authenticate, authorize("", true), async (req: Request, res: Response) => {
  try {
    const users = await MongoUser.find({ status: "active" }, "-password");
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.post("/users", authenticate, authorize("", true), async (req: any, res: Response) => {
  const { name, username, password, email, role, status, permissions } = req.body;
  if (!name || !username || !password || !email) {
    return res.status(400).json({ message: "All user fields are required" });
  }

  try {
    const existing = await MongoUser.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultPerms = role === "super_admin" ? "read,write,update,delete" : (permissions || "read,write,update");

    const newUser = await MongoUser.create({
      uuid: crypto.randomUUID(),
      name,
      username,
      password: hashedPassword,
      email,
      role: role || "user",
      status: status || "active",
      permissions: defaultPerms,
      authorUuid: req.user.uuid || null,
    });

    await logActivity("USER_CREATED", `Created user ${name} (${username})`, req.user.username);

    const responseUser = newUser.toJSON();
    delete (responseUser as any).password;
    res.status(201).json(responseUser);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.put("/users/:id", authenticate, authorize("", true), async (req: any, res: Response) => {
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
      user.password = await bcrypt.hash(password, 10);
    }
    user.authorUuid = req.user.uuid || null;

    await user.save();
    await logActivity("USER_UPDATED", `Updated user ${user.name} (${user.username})`, req.user.username);

    const responseUser = user.toJSON();
    delete (responseUser as any).password;
    res.json(responseUser);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.delete("/users/:id", authenticate, authorize("", true), async (req: any, res: Response) => {
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
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Receipts ---
apiRouter.get("/receipts", async (req: Request, res: Response) => {
  const { search, reason, dateFrom, dateTo, page = "1", limit = "10" } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const whereClause: any = { status: "active" };

  if (search) {
    const searchRegex = new RegExp(search as string, "i");
    whereClause.$or = [
      { name: searchRegex },
      { receiptNo: searchRegex },
      { foodName: searchRegex },
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
    const rows = await MongoReceipt.find(whereClause)
      .sort({ createdDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      data: rows,
      total: count,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum),
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.get("/receipts/:id", async (req: Request, res: Response) => {
  try {
    const receipt = await MongoReceipt.findOne({ uuid: req.params.id });
    if (!receipt || receipt.status === "inactive") {
      return res.status(404).json({ message: "Receipt not found" });
    }
    res.json(receipt);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.post("/receipts", authenticate, authorize("write"), async (req: any, res: Response) => {
  const { name, reason, amount, foodName, foodQty, image, createdDate, mobile, address, paymentMode } = req.body;
  if (!name || !reason || !image || !createdDate || !mobile) {
    return res.status(400).json({ message: "Name, Reason, Date, Image and Phone Number are required" });
  }

  try {
    // Generate simple receipt number based on total active receipts
    const totalReceipts = await MongoReceipt.countDocuments({ status: "active" });
    const receiptNo = `REC-${1000 + totalReceipts + 1}`;

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
      paymentMode: paymentMode || "Cash",
    });

    await logActivity("RECEIPT_CREATED", `Created receipt ${receiptNo} for ${name}`, req.user.username);
    res.status(201).json(receipt);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.put("/receipts/:id", authenticate, authorize("update"), async (req: any, res: Response) => {
  const { name, reason, amount, foodName, foodQty, image, createdDate, mobile, address, paymentMode } = req.body;
  try {
    const receipt = await MongoReceipt.findOne({ uuid: req.params.id });
    if (!receipt || receipt.status === "inactive") {
      return res.status(404).json({ message: "Receipt not found" });
    }

    // Mark previous revision as inactive
    receipt.status = "inactive";
    await receipt.save();

    // Create a new entry in database for the updated receipt (append-only)
    const newReceipt = await MongoReceipt.create({
      uuid: crypto.randomUUID(),
      receiptNo: receipt.receiptNo, // Keep the same receipt number
      name: name !== undefined ? name : receipt.name,
      reason: reason !== undefined ? reason : receipt.reason,
      amount: reason === "Food" ? null : (amount !== undefined ? amount : receipt.amount),
      foodName: reason === "Food" ? (foodName !== undefined ? foodName : receipt.foodName) : null,
      foodQty: reason === "Food" ? (foodQty !== undefined ? foodQty : receipt.foodQty) : null,
      image: image !== undefined ? image : receipt.image,
      createdDate: createdDate !== undefined ? createdDate : receipt.createdDate,
      createdBy: receipt.createdBy,
      status: "active",
      authorUuid: req.user.uuid || null,
      mobile: mobile !== undefined ? mobile : receipt.mobile,
      address: address !== undefined ? address : receipt.address,
      paymentMode: paymentMode !== undefined ? paymentMode : (receipt.paymentMode || "Cash"),
    });

    await logActivity("RECEIPT_UPDATED", `Updated receipt ${receipt.receiptNo} for ${receipt.name} (New version: ${newReceipt.uuid})`, req.user.username);
    res.json(newReceipt);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.delete("/receipts/:id", authenticate, authorize("delete"), async (req: any, res: Response) => {
  try {
    const receipt = await MongoReceipt.findOne({ uuid: req.params.id });
    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    receipt.status = "inactive";
    await receipt.save();
    await logActivity("RECEIPT_DELETED", `Deactivated receipt ${receipt.receiptNo} of ${receipt.name}`, req.user.username);
    res.json({ message: "Receipt deactivated successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Yearly Events ---
apiRouter.get("/yearly_events", async (req: Request, res: Response) => {
  try {
    const events = await MongoYearlyEvent.find({ status: "active" }).sort({ date: 1 });
    res.json(events);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.post("/yearly_events", authenticate, authorize("write"), async (req: any, res: Response) => {
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
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.put("/yearly_events/:id", authenticate, authorize("update"), async (req: any, res: Response) => {
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
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.delete("/yearly_events/:id", authenticate, authorize("delete"), async (req: any, res: Response) => {
  try {
    const event = await MongoYearlyEvent.findOne({ uuid: req.params.id });
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.status = "inactive";
    await event.save();
    await logActivity("YEARLY_EVENT_DELETED", `Deactivated yearly event: ${event.title}`, req.user.username);
    res.json({ message: "Event deactivated successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Monthly Events ---
apiRouter.get("/monthly_events", async (req: Request, res: Response) => {
  try {
    const events = await MongoMonthlyEvent.find({ status: "active" }).sort({ date: 1 });
    res.json(events);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.post("/monthly_events", authenticate, authorize("write"), async (req: any, res: Response) => {
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
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.put("/monthly_events/:id", authenticate, authorize("update"), async (req: any, res: Response) => {
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
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.delete("/monthly_events/:id", authenticate, authorize("delete"), async (req: any, res: Response) => {
  try {
    const event = await MongoMonthlyEvent.findOne({ uuid: req.params.id });
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.status = "inactive";
    await event.save();
    await logActivity("MONTHLY_EVENT_DELETED", `Deactivated monthly event: ${event.title}`, req.user.username);
    res.json({ message: "Event deactivated successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Expenses ---
apiRouter.get("/expenses", async (req: Request, res: Response) => {
  const { search, category, page = "1", limit = "10" } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const whereClause: any = { status: "active" };

  if (search) {
    const searchRegex = new RegExp(search as string, "i");
    whereClause.$or = [
      { name: searchRegex },
      { description: searchRegex },
    ];
  }

  if (category) {
    whereClause.category = category;
  }

  try {
    const count = await MongoExpense.countDocuments(whereClause);
    const rows = await MongoExpense.find(whereClause)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      data: rows,
      total: count,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum),
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.post("/expenses", authenticate, authorize("write"), async (req: any, res: Response) => {
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
      paymentMode: paymentMode || "Cash",
    });

    await logActivity("EXPENSE_CREATED", `Created expense: ${name} (Rs. ${amount})`, req.user.username);
    res.status(201).json(expense);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.put("/expenses/:id", authenticate, authorize("update"), async (req: any, res: Response) => {
  const { name, category, amount, description, date, bill, paymentMode } = req.body;
  try {
    const expense = await MongoExpense.findOne({ uuid: req.params.id });
    if (!expense || expense.status === "inactive") return res.status(404).json({ message: "Expense not found" });

    // Mark previous revision as inactive
    expense.status = "inactive";
    await expense.save();

    // Create a new entry in database for the updated expense (append-only)
    const newExpense = await MongoExpense.create({
      uuid: crypto.randomUUID(),
      name: name !== undefined ? name : expense.name,
      category: category !== undefined ? category : expense.category,
      amount: amount !== undefined ? amount : expense.amount,
      description: description !== undefined ? description : expense.description,
      date: date !== undefined ? date : expense.date,
      bill: bill !== undefined ? bill : expense.bill,
      createdBy: expense.createdBy,
      status: "active",
      authorUuid: req.user.uuid || null,
      paymentMode: paymentMode !== undefined ? paymentMode : (expense.paymentMode || "Cash"),
    });

    await logActivity("EXPENSE_UPDATED", `Updated expense: ${expense.name} (New version: ${newExpense.uuid})`, req.user.username);
    res.json(newExpense);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.delete("/expenses/:id", authenticate, authorize("delete"), async (req: any, res: Response) => {
  try {
    const expense = await MongoExpense.findOne({ uuid: req.params.id });
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    expense.status = "inactive";
    await expense.save();
    await logActivity("EXPENSE_DELETED", `Deactivated expense: ${expense.name}`, req.user.username);
    res.json({ message: "Expense deactivated successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Banners (Super Admin & Trustees) ---
apiRouter.get("/banners", async (req: Request, res: Response) => {
  try {
    const banners = await MongoBanner.find({
      status: "active",
      active: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    });
    res.json(banners);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.get("/banners/all", authenticate, authorize("", false), async (req: Request, res: Response) => {
  try {
    const banners = await MongoBanner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.post("/banners", authenticate, authorize("", false), async (req: any, res: Response) => {
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
      active: active !== undefined ? active : true,
      status: "active",
      authorUuid: req.user.uuid || null
    });
    await logActivity("BANNER_CREATED", `Created banner: ${title}`, req.user.username);
    res.status(201).json(banner);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.delete("/banners/:id", authenticate, authorize("", false), async (req: any, res: Response) => {
  try {
    const banner = await MongoBanner.findOne({ uuid: req.params.id });
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    banner.status = "inactive";
    banner.active = false;
    await banner.save();
    await logActivity("BANNER_DELETED", `Deactivated banner: ${banner.title}`, req.user.username);
    res.json({ message: "Banner deactivated successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Slider Images (Super Admin Only) ---
apiRouter.get("/slider_images", async (req: Request, res: Response) => {
  try {
    const sliderImages = await MongoSliderImage.find({ status: "active" });
    res.json(sliderImages);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.post("/slider_images", authenticate, authorize("", true), async (req: any, res: Response) => {
  const { image, title, active } = req.body;
  if (!image || !title) {
    return res.status(400).json({ message: "Image and Title are required" });
  }
  try {
    const sliderImg = await MongoSliderImage.create({
      uuid: crypto.randomUUID(),
      image,
      title,
      active: active !== undefined ? active : true,
      status: "active",
      authorUuid: req.user.uuid || null
    });
    await logActivity("SLIDER_IMAGE_CREATED", `Created slider image: ${title}`, req.user.username);
    res.status(201).json(sliderImg);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.delete("/slider_images/:id", authenticate, authorize("", true), async (req: any, res: Response) => {
  try {
    const sliderImg = await MongoSliderImage.findOne({ uuid: req.params.id });
    if (!sliderImg) return res.status(404).json({ message: "Slider image not found" });

    sliderImg.status = "inactive";
    await sliderImg.save();
    await logActivity("SLIDER_IMAGE_DELETED", `Deactivated slider image: ${sliderImg.title}`, req.user.username);
    res.json({ message: "Slider image deactivated successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Dashboard Summary API ---
apiRouter.get("/dashboard/summary", async (req: Request, res: Response) => {
  try {
    // 1. Sum up Receipts
    const receipts = await MongoReceipt.find({ status: "active" }, "amount");
    const totalReceipts = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);

    // 2. Sum up Expenses
    const expenses = await MongoExpense.find({ status: "active" }, "amount");
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // 3. Count Upcoming events
    const yearlyUpcomingCount = await MongoYearlyEvent.countDocuments({ status: "active", eventStatus: "upcoming" });
    const monthlyUpcomingCount = await MongoMonthlyEvent.countDocuments({ status: "active", eventStatus: "upcoming" });
    const upcomingEvents = yearlyUpcomingCount + monthlyUpcomingCount;

    // 4. Yearly count
    const yearlyEvents = await MongoYearlyEvent.countDocuments({ status: "active" });

    // 5. Monthly count
    const monthlyEvents = await MongoMonthlyEvent.countDocuments({ status: "active" });

    // 6. Recent logs (last 8)
    const recentActivities = await MongoActivityLog.find({ status: "active" })
      .sort({ timestamp: -1 })
      .limit(8);

    res.json({
      totalReceipts,
      totalExpenses,
      upcomingEvents,
      yearlyEvents,
      monthlyEvents,
      recentActivities,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Trustee Management APIs (Admin/Super Admin only) ---
function blockTrustees(req: any, res: Response, next: () => void) {
  if (req.user && req.user.role === "trustee") {
    return res.status(403).json({ message: "Access forbidden: Trustees cannot manage trustee accounts" });
  }
  next();
}

apiRouter.get("/trustees", authenticate, blockTrustees, async (req: Request, res: Response) => {
  try {
    const trustees = await MongoTrustee.find({ status: "active" }).sort({ createdAt: -1 });
    const trusteeList = await Promise.all(
      trustees.map(async (t) => {
        const perms = await MongoTrusteePermission.find({ trusteeUuid: t.uuid, status: "active" });
        const obj = t.toJSON();
        (obj as any).permissions = perms;
        return obj;
      })
    );
    res.json(trusteeList);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.get("/trustees/:id", authenticate, blockTrustees, async (req: Request, res: Response) => {
  try {
    const trustee = await MongoTrustee.findOne({ uuid: req.params.id });
    if (!trustee || trustee.status === "inactive") {
      return res.status(404).json({ message: "Trustee not found" });
    }
    const perms = await MongoTrusteePermission.find({ trusteeUuid: trustee.uuid, status: "active" });
    const obj = trustee.toJSON();
    (obj as any).permissions = perms;
    res.json(obj);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.post("/trustees", authenticate, blockTrustees, async (req: any, res: Response) => {
  const { fullName, username, password, mobile, email, designation, profilePhoto, status, permissions } = req.body;
  if (!fullName || !username || !password) {
    return res.status(400).json({ message: "Full Name, Username, and Password are required" });
  }

  try {
    const existing = await MongoTrustee.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
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
      authorUuid: req.user.uuid || null,
    });

    // Create permissions
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
        authorUuid: req.user.uuid || null,
      };
    });

    const perms = await MongoTrusteePermission.insertMany(permsToCreate);
    await logActivity("TRUSTEE_CREATED", `Created trustee account for ${fullName} (${username})`, req.user.username);

    const createdObj = trustee.toJSON();
    (createdObj as any).permissions = perms;
    res.status(201).json(createdObj);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.put("/trustees/:id", authenticate, blockTrustees, async (req: any, res: Response) => {
  const { fullName, mobile, email, designation, profilePhoto, status, permissions } = req.body;
  try {
    const trustee = await MongoTrustee.findOne({ uuid: req.params.id });
    if (!trustee || trustee.status === "inactive") {
      return res.status(404).json({ message: "Trustee not found" });
    }

    if (fullName) trustee.fullName = fullName;
    if (mobile !== undefined) trustee.mobile = mobile;
    if (email !== undefined) trustee.email = email;
    if (designation !== undefined) trustee.designation = designation;
    if (profilePhoto !== undefined) trustee.profilePhoto = profilePhoto;
    if (status) trustee.status = status;
    trustee.authorUuid = req.user.uuid || null;

    await trustee.save();

    if (permissions) {
      // Update permissions - remove existing and insert new
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
          authorUuid: req.user.uuid || null,
        };
      });
      await MongoTrusteePermission.insertMany(permsToCreate);
    }

    await logActivity("TRUSTEE_UPDATED", `Updated trustee account for ${trustee.fullName}`, req.user.username);

    const perms = await MongoTrusteePermission.find({ trusteeUuid: trustee.uuid, status: "active" });
    const updatedObj = trustee.toJSON();
    (updatedObj as any).permissions = perms;
    res.json(updatedObj);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.patch("/trustees/:id/status", authenticate, blockTrustees, async (req: any, res: Response) => {
  const { status } = req.body;
  if (!status || (status !== "active" && status !== "inactive")) {
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
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.patch("/trustees/:id/reset-password", authenticate, blockTrustees, async (req: any, res: Response) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    const trustee = await MongoTrustee.findOne({ uuid: req.params.id });
    if (!trustee || trustee.status === "inactive") {
      return res.status(404).json({ message: "Trustee not found" });
    }

    trustee.passwordHash = await bcrypt.hash(password, 10);
    trustee.authorUuid = req.user.uuid || null;
    await trustee.save();

    await logActivity("TRUSTEE_PASSWORD_RESET", `Reset password for trustee ${trustee.fullName}`, req.user.username);
    res.json({ message: "Password reset successful" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.delete("/trustees/:id", authenticate, blockTrustees, async (req: any, res: Response) => {
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
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- Board Members (Public Read, Admin Write) ---
apiRouter.get("/board_members", async (req: Request, res: Response) => {
  try {
    const members = await MongoBoardMember.find({ status: "active" }).sort({ displayOrder: 1, createdAt: 1 });
    res.json(members);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.post("/board_members", authenticate, authorize("write"), async (req: any, res: Response) => {
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
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
      status: "active",
      authorUuid: req.user.uuid || null,
    });
    await logActivity("BOARD_MEMBER_CREATED", `Added board member: ${name}`, req.user.username);
    res.status(201).json(member);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.put("/board_members/:id", authenticate, authorize("update"), async (req: any, res: Response) => {
  const { name, designation, profilePhoto, displayOrder } = req.body;
  try {
    const member = await MongoBoardMember.findOne({ uuid: req.params.id });
    if (!member || member.status === "inactive") {
      return res.status(404).json({ message: "Board member not found" });
    }
    if (name) member.name = name.trim();
    if (designation !== undefined) member.designation = designation?.trim() || null;
    if (profilePhoto !== undefined) member.profilePhoto = profilePhoto || null;
    if (displayOrder !== undefined) member.displayOrder = Number(displayOrder);
    member.authorUuid = req.user.uuid || null;
    await member.save();
    await logActivity("BOARD_MEMBER_UPDATED", `Updated board member: ${member.name}`, req.user.username);
    res.json(member);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

apiRouter.delete("/board_members/:id", authenticate, authorize("delete"), async (req: any, res: Response) => {
  try {
    const member = await MongoBoardMember.findOne({ uuid: req.params.id });
    if (!member) {
      return res.status(404).json({ message: "Board member not found" });
    }
    member.status = "inactive";
    member.authorUuid = req.user.uuid || null;
    await member.save();
    await logActivity("BOARD_MEMBER_DELETED", `Removed board member: ${member.name}`, req.user.username);
    res.json({ message: "Board member removed successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});
