const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use an App Password, not your real password
  },
});

const sendAnswerNotification = async ({ toEmail, toName, questionTitle, questionId, answererName }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("📧 Email not configured — skipping notification");
    return;
  }

  const questionUrl = `${process.env.CLIENT_URL}/questions/${questionId}`;

  try {
    await transporter.sendMail({
      from: `"Tutorly" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `💬 ${answererName} answered your question on Tutorly`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f7f8fc; margin: 0; padding: 0; }
            .container { max-width: 560px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
            .header { background: #1a1a2e; padding: 28px 32px; }
            .logo { color: white; font-size: 1.4rem; font-weight: 800; letter-spacing: -0.5px; }
            .body { padding: 32px; }
            .greeting { font-size: 1rem; color: #0d0f1a; margin-bottom: 16px; }
            .question-box { background: #f7f8fc; border-left: 3px solid #e94560; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 20px 0; }
            .question-box p { margin: 0; font-size: 0.95rem; color: #0d0f1a; font-weight: 600; line-height: 1.4; }
            .cta { display: inline-block; background: #e94560; color: white; padding: 13px 26px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.95rem; margin: 20px 0; }
            .footer { padding: 20px 32px; border-top: 1px solid #e2e5f0; font-size: 0.78rem; color: #9aa0be; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎓 Tutorly</div>
            </div>
            <div class="body">
              <p class="greeting">Hi ${toName},</p>
              <p style="color: #5a6080; font-size: 0.95rem; line-height: 1.6;">
                <strong>${answererName}</strong> just answered your question:
              </p>
              <div class="question-box">
                <p>${questionTitle}</p>
              </div>
              <p style="color: #5a6080; font-size: 0.9rem;">
                Review their answer and mark it as accepted if it helped you!
              </p>
              <a href="${questionUrl}" class="cta">View Answer →</a>
            </div>
            <div class="footer">
              You're receiving this because you asked a question on Tutorly. 
              This is a free community platform — always free, always open.
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log(`📧 Notification sent to ${toEmail}`);
  } catch (err) {
    console.error("Email send error:", err.message);
  }
};

module.exports = { sendAnswerNotification };
