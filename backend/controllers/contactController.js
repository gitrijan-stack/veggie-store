import pool from "../config/db.js";

// Submit contact form — POST /api/contact/submit
export const submitContact = async (req, res) => {
  try {
    const { name, email, topic, message } = req.body;

    if (!name || !email || !message) {
      return res.json({ success: false, message: "Name, email and message are required" });
    }

    await pool.query(
      "INSERT INTO contact_messages (name, email, topic, message) VALUES (?, ?, ?, ?)",
      [name, email, topic || null, message]
    );

    return res.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Newsletter subscribe — POST /api/contact/newsletter
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    await pool.query(
      "INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)",
      [email]
    );

    return res.json({ success: true, message: "Subscribed successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
