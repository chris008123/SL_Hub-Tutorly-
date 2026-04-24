const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async ({ toEmail, toName, verificationUrl }) => {
  if (!process.env.RESEND_API_KEY) {
    console.log("📧 Resend not configured — skipping verification email");
    return;
  }

  try {
    await resend.emails.send({
      from: "SL_Hub <onboarding@resend.dev>",
      to: toEmail,
      subject: "✅ Verify your SL_Hub account",
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
            .cta { display: inline-block; background: #e94560; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.95rem; margin: 20px 0; }
            .note { font-size: 0.82rem; color: #9aa0be; margin-top: 16px; line-height: 1.5; }
            .footer { padding: 20px 32px; border-top: 1px solid #e2e5f0; font-size: 0.78rem; color: #9aa0be; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎓 SL_Hub</div>
            </div>
            <div class="body">
              <p class="greeting">Hi ${toName},</p>
              <p style="color: #5a6080; font-size: 0.95rem; line-height: 1.6;">
                Welcome to SL_Hub! Please verify your email address to activate your account and start asking or answering questions.
              </p>
              <a href="${verificationUrl}" class="cta">Verify my email →</a>
              <p class="note">
                This link expires in <strong>24 hours</strong>.<br/>
                If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              SL_Hub — Free programming help for everyone.
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log(`📧 Verification email sent to ${toEmail}`);
  } catch (err) {
    console.error("Verification email error:", err.message);
  }
};

const sendAnswerNotification = async ({ toEmail, toName, questionTitle, questionId, answererName }) => {
  if (!process.env.RESEND_API_KEY) {
    console.log("📧 Resend not configured — skipping notification");
    return;
  }

  const questionUrl = `${process.env.CLIENT_URL}/questions/${questionId}`;

  try {
    await resend.emails.send({
      from: "SL_Hub <onboarding@resend.dev>",
      to: toEmail,
      subject: `💬 ${answererName} answered your question on SL_Hub`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f7f8fc; margin: 0; padding: 0; }
            .container { max-width: 560px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
            .header { background: #1a1a2e; padding: 28px 32px; }
            .logo { color: white; font-size: 1.4rem; font-weight: 800; }
            .body { padding: 32px; }
            .question-box { background: #f7f8fc; border-left: 3px solid #e94560; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 20px 0; }
            .question-box p { margin: 0; font-size: 0.95rem; color: #0d0f1a; font-weight: 600; }
            .cta { display: inline-block; background: #e94560; color: white; padding: 13px 26px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.95rem; margin: 20px 0; }
            .footer { padding: 20px 32px; border-top: 1px solid #e2e5f0; font-size: 0.78rem; color: #9aa0be; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header"><div class="logo">🎓 SL_Hub</div></div>
            <div class="body">
              <p style="color: #0d0f1a;">Hi ${toName},</p>
              <p style="color: #5a6080; font-size: 0.95rem; line-height: 1.6;">
                <strong>${answererName}</strong> just answered your question:
              </p>
              <div class="question-box"><p>${questionTitle}</p></div>
              <a href="${questionUrl}" class="cta">View Answer →</a>
            </div>
            <div class="footer">SL_Hub — Free programming help for everyone.</div>
          </div>
        </body>
        </html>
      `,
    });
    console.log(`📧 Answer notification sent to ${toEmail}`);
  } catch (err) {
    console.error("Answer notification error:", err.message);
  }
};

module.exports = { sendVerificationEmail, sendAnswerNotification };
