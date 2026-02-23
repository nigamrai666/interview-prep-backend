const db = require("../config/db");
const bcrypt = require("bcryptjs");

// LOGIN USER
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const query = "SELECT * FROM users WHERE email = ?";

  db.get ? (
    // 🔹 SQLITE
    db.get(query, [email], async (err, user) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (!user)
        return res.status(401).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials" });

      res.json({
        token: "demo-login-token",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    })
  ) : (
    // 🔹 MYSQL
    db.query(query, [email]).then(async ([rows]) => {
      if (rows.length === 0)
        return res.status(401).json({ message: "Invalid credentials" });

      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(401).json({ message: "Invalid credentials" });

      res.json({
        token: "demo-login-token",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    })
  );
};

exports.register = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // check if user exists
  const checkQuery = "SELECT id FROM users WHERE email = ?";

  db.get(checkQuery, [email], async (err, row) => {
    if (err) {
      return res.status(500).json({ message: "Database error" });
    }

    if (row) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery =
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

    db.run(insertQuery, [name, email, hashedPassword], function (err) {
      if (err) {
        return res.status(500).json({ message: "Insert failed" });
      }

      res.status(201).json({
        message: "User registered successfully",
        token: "demo-login-token",
        user: {
          id: this.lastID,
          name,
          email,
        },
      });
    });
  });
};
