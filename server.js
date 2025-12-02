const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

dotenv.config();
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// --------------------
// MongoDB Connection
// --------------------
mongoose
  .connect(`${process.env.MONGODB_URI}`)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// --------------------
// Schemas & Models
// --------------------
const personalInfoSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  gmail: { type: String, required: true },
  about_me: String,
  phone: String,
  address: String,
});

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const PersonalInfo = mongoose.model("PersonalInfo", personalInfoSchema);
const Contact = mongoose.model("Contact", contactSchema);

// --------------------
// Routes
// --------------------
app.get("/personal_info", async (req, res) => {
  try {
    const info = await PersonalInfo.findOne();
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/contact", async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    // store in database
    await Contact.create({ name, email, phone, message });

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
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) return res.json({ message: "Email sending failed!" });
      return res.json({ message: "Message sent successfully!" });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Portfolio Backend Server is running");
});

// --------------------
// Start Server
// --------------------
app.listen(process.env.PORT || 5000, () =>
  console.log("Server running on port", process.env.PORT || 5000)
);
