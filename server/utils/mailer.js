const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async ({ toEmail, toName, verificationUrl }) => {
  if (!process.env.RESEND_API_KEY) {
    console.log("📧 Resend not configured — skipping verification email");
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: "SL_Hub <onboarding@resend.dev>",
      to: toEmail,
      subject: "✅ Verify your SL_Hub account",
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background: #f7f8fc; margin: 0; padding: 0;">
          <div style="max-width: 560px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden;">
            <div style="background: #1a1a2e; padding: 28px 32px;">
              <div style="color: white; font-size: 1.4rem; font-weight: 800;">🎓 SL_Hub</div>
            </div>
            <div style="padding: 32px;">
              <p style="color: #0d0f1a;">Hi ${toName},</p>
              <p style="color: #5a6080; font-size: 0.95rem; line-height: 1.6;">
                Welcome to SL_Hub! Please verify your email to activate your account.
              </p>
              <a href="${verificationUrl}" style="display: inline-block; background: #e94560; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0;">
                Verify my email →
              </a>
              <p style="font-size: 0.82rem; color: #9aa0be; margin-top: 16px;">
                This link expires in <strong>24 hours</strong>.<br/>
                If you didn't create an account, ignore this email.
              </p>
            </div>
            <div style="padding: 20px 32px; border-top: 1px solid #e2e5f0; font-size: 0.78rem; color: #9aa0be;">
              SL_Hub — Free programming help for everyone.
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) console.error("Resend error:", JSON.stringify(error));
    else console.log(`📧 Verification email sent to ${toEmail}`);
  } catch (err) {
    console.error("Verification email error:", err.message);
  }
};

const sendAnswerNotification = async ({ toEmail, toName, questionTitle, questionId, answererName }) => {
  if (!process.env.RESEND_API_KEY) return;

  const questionUrl = `${process.env.CLIENT_URL}/questions/${questionId}`;

  try {
    const { error } = await resend.emails.send({
      from: "SL_Hub <onboarding@resend.dev>",
      to: toEmail,
      subject: `💬 ${answererName} answered your question on SL_Hub`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background: #f7f8fc; margin: 0; padding: 0;">
          <div style="max-width: 560px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden;">
            <div style="background: #1a1a2e; padding: 28px 32px;">
              <div style="color: white; font-size: 1.4rem; font-weight: 800;">🎓 SL_Hub</div>
            </div>
            <div style="padding: 32px;">
              <p style="color: #0d0f1a;">Hi ${toName},</p>
              <p style="color: #5a6080;">
                <strong>${answererName}</strong> just answered your question:
              </p>
              <div style="background: #f7f8fc; border-left: 3px solid #e94560; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 20px 0;">
                <p style="margin: 0; font-weight: 600; color: #0d0f1a;">${questionTitle}</p>
              </div>
              <a href="${questionUrl}" style="display: inline-block; background: #e94560; color: white; padding: 13px 26px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                View Answer →
              </a>
            </div>
            <div style="padding: 20px 32px; border-top: 1px solid #e2e5f0; font-size: 0.78rem; color: #9aa0be;">
              SL_Hub — Free programming help for everyone.
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) console.error("Resend error:", JSON.stringify(error));
    else console.log(`📧 Answer notification sent to ${toEmail}`);
  } catch (err) {
    console.error("Answer notification error:", err.message);
  }
};

module.exports = { sendVerificationEmail, sendAnswerNotification };
