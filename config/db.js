const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// ❌ NO persistent disk on free tier
// ✅ Use local file (will reset on redeploy)
const dbPath = path.join(__dirname, "../database/interview_prep.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("SQLite error:", err);
  } else {
    console.log("SQLite connected (FREE tier, non-persistent)");
  }
});

module.exports = db;