require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

db.connect((err) => {
  if (err) {
    console.log("MySQL Error:", err);
    return;
  }
  console.log("MySQL Connected");
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, hash],
    (err) => {
      if (err) return res.send("خطأ: البريد موجود أو مشكلة بالبيانات");
      res.send("تم حفظ الحساب بنجاح ✅");
    }
  );
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.send("خطأ بالسيرفر");

    if (result.length === 0) return res.send("البريد غير موجود");

    const user = result[0];
    const ok = await bcrypt.compare(password, user.password);

    if (ok) {
      res.send("تم تسجيل الدخول ✅");
    } else {
      res.send("كلمة المرور خطأ ❌");
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});;
