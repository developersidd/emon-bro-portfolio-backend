const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mysql = require("mysql2");

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

// MYSQL DB CONNECTION
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "portfolio_db",
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
      user: "emonabujafor@gmail.com",
      pass: "npamuevcbcqkdsja",
    },
  });

  let mailOptions = {
    from: email,
    to: "emonabujafor@gmail.com",
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
