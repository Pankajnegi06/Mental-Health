const Contact = require("../Models/ContactSchema");
const { transporter, transporter2 } = require("../Config/nodemailer");

require('dotenv').config();

const addFeedback = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.json({ success: false });
  }


  try {
    const newUser = new Contact({ name, email, message });


    const mailDetails = {
      from: process.env.SENDER_EMAIL,
      to: process.env.SENDER_EMAIL,
      subject: "New Feedback Received - IntelliCare",
      html: `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; padding: 20px; background-color: #f4f8fb; color: #333;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 25px 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        
        <h2 style="color: #2c3e50; margin-bottom: 10px;">🩺 New Feedback Received</h2>
        
        <p style="font-size: 15px; line-height: 1.6;">
          <strong>${name}</strong> (<a href="mailto:${email}" style="color: #0077cc;">${email}</a>) has submitted a message through <strong>Intellicare</strong>:
        </p>
        
        <blockquote style="margin: 20px 0; padding: 15px; background-color: #eef4f9; border-left: 4px solid #0077cc; font-style: italic;">
          ${message}
        </blockquote>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
        
        <p style="font-size: 13px; color: #888;">
          This email was generated automatically from the Intellicare feedback form.
        </p>
      </div>
    </div>
  `,
    };

    // Send feedback email asynchronously without blocking
    transporter.sendMail(mailDetails).catch((error) => {
      console.error("Failed to send feedback email:", error.message);
    });

    await newUser.save();

    return res.json({ success: true, message: "msg saved" });
  } catch (err) {
    // console.error("Error occuruing", err);
    return res.json({ success: false, message: err.message });
  }
};

module.exports = addFeedback;