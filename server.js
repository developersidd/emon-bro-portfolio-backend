const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mysql = require("mysql2");
dotenv.config();
const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

// MYSQL DB CONNECTION
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected");
});

app.get("/personal_info", (req, res) => {
  const sql = "SELECT * FROM personal_info LIMIT 1";
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result[0]);
  });
});

// CONTACT FORM SUBMIT ROUTE
app.post("/contact", (req, res) => {
  const { name, email, phone, message } = req.body;

  // store in database
  const sql =
    "INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)";
  db.query(sql, [name, email, phone, message]);

  // send email
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let mailOptions = {
    from: email,
    to: process.env.EMAIL_USER,
    subject: "New Contact Message",
    text: `
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Message: ${message}
    `,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) return res.json({ message: "Email sending failed!" });
    return res.json({ message: "Message sent successfully!" });
  });
});

app.get("/", (req, res) => {
  res.send("Portfolio Backend Server is running");
});

// Run Server
app.listen(process.env.PORT || 5000, () =>
  console.log("Server running on port 5000")
);
