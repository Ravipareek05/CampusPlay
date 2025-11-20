// // /**
// //  * Run using:
// //  *   node server/scripts/importUsers.js server/csv/users.csv
// //  */

// // const fs = require("fs");
// // const path = require("path");
// // const Papa = require("papaparse");
// // const mongoose = require("mongoose");
// // const bcrypt = require("bcrypt");

// // require("dotenv").config();

// // // Import your User model
// // const User = require("../models/user");

// // // Use your actual MongoDB env variable
// // const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// // const CSV_PATH = process.argv[2];
// // if (!CSV_PATH) {
// //   console.error("\n❌ ERROR: Please provide a CSV file path.\nExample:\n node server/scripts/importUsers.js server/csv/users.csv\n");
// //   process.exit(1);
// // }

// // async function importUsers() {
// //   console.log("📥 Importing users from CSV:", CSV_PATH);

// //   const csvText = fs.readFileSync(path.resolve(CSV_PATH), "utf8");
// //   const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

// //   const rows = parsed.data;
// //   console.log("➡️ Rows found in CSV:", rows.length);

// //   // Connect to DB
// //   await mongoose.connect(MONGO_URI);
// //   console.log(" Connected to MongoDB");

// //   let created = 0,
// //     updated = 0;

// //   for (let r of rows) {
// //     const email = (r.email || "").trim().toLowerCase();
// //     const name = (r.name || "").trim();
// //     const password = (r.password || "").trim();

// //     if (!email || !password) {
// //       console.log("⚠️ Skipping row (missing email/password):", r);
// //       continue;
// //     }

// //     // Hash password
// //     const hashedPassword = await bcrypt.hash(password, 10);

// //     // Check if user already exists
// //     const existing = await User.findOne({ email });

// //     if (existing) {
// //       // Update existing user
// //       existing.name = name || existing.name;
// //       existing.password = hashedPassword;
// //       await existing.save();
// //       updated++;
// //     } else {
// //       // Create new user
// //       await User.create({
// //         email,
// //         name,
// //         password: hashedPassword,
// //       });
// //       created++;
// //     }
// //   }

// //   console.log("\n✅ IMPORT COMPLETE");
// //   console.log(`🆕 Created users: ${created}`);
// //   console.log(`♻️ Updated users: ${updated}`);

// //   await mongoose.disconnect();
// //   console.log("🔌 MongoDB disconnected\n");
// // }

// // importUsers();


// // server/scripts/importUsers.js
// // Usage:
// //   node server/scripts/importUsers.js path/to/users.csv
// //   node server/scripts/importUsers.js path/to/users.xlsx

// require("dotenv").config({
//   path: require("path").join(__dirname, "..", ".env")
// });

// const fs = require("fs");
// const path = require("path");
// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// const Papa = require("papaparse");       // for CSV
// const xlsx = require("xlsx");           // for .xlsx

// // adjust this require to match your file name / casing
// const User = require("../models/user"); // or "../models/User" depending on your filename

// const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
// const INPUT = process.argv[2];

// if (!INPUT) {
//   console.error("\n✖ ERROR: Provide CSV/XLSX path.\nExample:\n  node server/scripts/importUsers.js ../client/csv/users.csv\n");
//   process.exit(1);
// }

// async function parseFile(filePath) {
//   const ext = path.extname(filePath).toLowerCase();
//   if (ext === ".csv") {
//     const txt = fs.readFileSync(filePath, "utf8");
//     const parsed = Papa.parse(txt, { header: true, skipEmptyLines: true });
//     return parsed.data;
//   } else if (ext === ".xlsx" || ext === ".xls") {
//     const wb = xlsx.readFile(filePath);
//     const sheetName = wb.SheetNames[0];
//     const sheet = wb.Sheets[sheetName];
//     return xlsx.utils.sheet_to_json(sheet, { defval: "" });
//   } else {
//     throw new Error("Unsupported file type: " + ext);
//   }
// }

// async function importUsers(filePath) {
//   console.log("Importing from:", filePath);
//   const rows = await parseFile(filePath);
//   console.log("Rows parsed:", rows.length);

//   if (!rows.length) {
//     console.log("No rows to import.");
//     return;
//   }

//   await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
//   console.log("Connected to MongoDB");

//   let created = 0, skipped = 0, updated = 0;
//   for (const raw of rows) {
//     // normalize keys (case-insensitive)
//     const row = {};
//     for (const k of Object.keys(raw)) row[k.trim().toLowerCase()] = raw[k];

//     const name = (row.name || row.username || "").toString().trim();
//     const email = (row.email || "").toString().trim().toLowerCase();
//     const password = (row.password || "").toString();

//     if (!email || !password) {
//       skipped++;
//       console.warn("Skipping (missing email/password):", raw);
//       continue;
//     }

//     // hash password
//     const saltRounds = 10;
//     const hashed = await bcrypt.hash(password, saltRounds);

//     // upsert user
//     const update = {
//       name: name || email.split("@")[0],
//       email,
//       password: hashed,
//       updatedAt: new Date()
//     };

//     const res = await User.findOneAndUpdate(
//       { email },
//       { $setOnInsert: update, $set: { name: update.name, password: update.password } },
//       { upsert: true, new: true, setDefaultsOnInsert: true }
//     );

//     // Count whether newly created or already existed:
//     // findOneAndUpdate with upsert doesn't directly say; we can try to detect by createdAt if present.
//     if (res && res.createdAt && ((Date.now() - res.createdAt.getTime()) < 5000)) {
//       created++;
//     } else {
//       // In many cases you'll get existing document with older createdAt.
//       // We approximate: if updated recently, count as updated, else skipped
//       updated++;
//     }
//   }

//   console.log(`Done — created: ${created}, updated/skipped: ${updated + skipped} (skipped:${skipped}, updated:${updated})`);
//   await mongoose.disconnect();
// }

// // Run
// importUsers(path.resolve(INPUT)).catch(err => {
//   console.error("Import failed:", err);
//   process.exit(1);
// });



// server/scripts/importUsers.js
// Usage examples:
//   node server/scripts/importUsers.js server/csv/campusplay_data.csv
//   node server/scripts/importUsers.js "/mnt/data/campusplay_data (1).csv"

const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Papa = require("papaparse");
let xlsx;
try { xlsx = require("xlsx"); } catch (e) { /* xlsx optional */ }

// adjust require to match filename/casing of your model
// your project has server/models/user.js (lowercase), so we require that
const User = require("../models/user");

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("ERROR: MONGO_URI or MONGODB_URI not set in server/.env. Aborting.");
  process.exit(1);
}

const INPUT = process.argv[2];
if (!INPUT) {
  console.error("Usage: node server/scripts/importUsers.js path/to/file.csv");
  process.exit(1);
}

function parseCsvSync(filePath) {
  const txt = fs.readFileSync(filePath, "utf8");
  const parsed = Papa.parse(txt, { header: true, skipEmptyLines: true });
  if (parsed.errors && parsed.errors.length) {
    console.warn("CSV parse warnings (first 5):", parsed.errors.slice(0,5));
  }
  return parsed.data;
}

function parseXlsxSync(filePath) {
  if (!xlsx) throw new Error("xlsx module not installed. Install with: npm install xlsx");
  const wb = xlsx.readFile(filePath);
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet, { defval: "" });
}

function normalizeRowKeys(row) {
  const out = {};
  Object.keys(row).forEach(k => {
    out[k.toLowerCase().trim()] = row[k];
  });
  return out;
}

function getField(row, candidates = []) {
  for (const cand of candidates) {
    const lk = cand.toLowerCase();
    if (lk in row) return (row[lk] ?? "").toString();
  }
  return "";
}

function generateTempPassword(len = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

async function parseFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".csv") return parseCsvSync(filePath);
  if (ext === ".xlsx" || ext === ".xls") return parseXlsxSync(filePath);
  throw new Error("Unsupported file type: " + ext);
}

(async function main() {
  try {
    const filePath = path.resolve(INPUT);
    console.log("Importing from:", filePath);

    const rawRows = await parseFile(filePath);
    console.log("Rows parsed:", rawRows.length);

    if (!rawRows.length) {
      console.log("No rows found. Exiting.");
      return;
    }

    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");

    const generated = []; // collect temp passwords to write out
    let created = 0, updated = 0, skipped = 0;

    for (const raw of rawRows) {
      const row = normalizeRowKeys(raw);

      // email candidates
      const email = (getField(row, ["email", "email address", "email_address", "e-mail", "player_email"]) || "").trim().toLowerCase();

      // name candidates: full name OR first+last
      let name = (getField(row, ["name", "full name", "fullname", "player_name"]) || "").trim();
      if (!name) {
        const first = (getField(row, ["first name", "firstname"]) || "").trim();
        const last = (getField(row, ["last name", "lastname"]) || "").trim();
        name = (first + " " + last).trim();
      }

      // password candidates
      let password = (getField(row, ["password", "pass", "pwd", "user_password"]) || "").toString();

      if (!email) {
        skipped++;
        console.warn("Skipping (missing email):", raw);
        continue;
      }

      let usedTemp = false;
      if (!password) {
        password = generateTempPassword(10);
        usedTemp = true;
      }

      // hash
      const hashed = await bcrypt.hash(password, 10);

      // upsert
      const existing = await User.findOne({ email });
      if (existing) {
        existing.name = name || existing.name;
        existing.password = hashed; // matches your model field 'password'
        await existing.save();
        updated++;
      } else {
        await User.create({ email, name: name || email.split("@")[0], password: hashed });
        created++;
      }

      if (usedTemp) generated.push({ email, name, tempPassword: password });
    }

    // if any generated passwords, write them out
    if (generated.length) {
      const outCsv = Papa.unparse(generated);
      const outName = `import-generated-passwords-${Date.now()}.csv`;
      const outPath = path.resolve(outName);
      fs.writeFileSync(outPath, outCsv, "utf8");
      console.log("Wrote generated password CSV:", outPath);
      console.log("=> Contains columns: email,name,tempPassword");
    }

    console.log(`Done — created: ${created}, updated: ${updated}, skipped: ${skipped}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Import failed:", err);
    process.exit(1);
  }
})();
