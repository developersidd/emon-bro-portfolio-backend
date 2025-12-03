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
    console.log("🚀 ~ info:", info);
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/contact", async (req, res) => {
  const { name, email, phone, message } = req.body;
  try {
    // Store in database
    await Contact.create({ name, email, phone, message });

    // Respond immediately
    res.json({ message: "Message received successfully!" });

    // Send email asynchronously (don't await)
    sendEmailAsync(name, email, phone, message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Separate async function for email
async function sendEmailAsync(name, email, phone, message) {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let mailOptions = {
      from: process.env.EMAIL_USER, // Use your email, not the sender's
      replyTo: email, // Set reply-to as the sender
      to: process.env.EMAIL_USER,
      subject: `New Contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (err) {
    console.error("Email sending failed:", err);
  }
}
app.get("/", (req, res) => {
  res.send("Portfolio Backend Server is running");
});

// --------------------
// Start Server
// --------------------
app.listen(process.env.PORT || 5000, () =>
  console.log("Server running on port", process.env.PORT || 5000)
);
