import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOTPEmail = async (email, otpCode) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"ShopMe" <noreply@shopme.com>',
    to: email,
    subject: `Your ShopMe Password Reset Code - ${otpCode}`,
    html: `
      <div style="background-color: #f9fafb; padding: 40px 20px; font-family: sans-serif;">
        <div style="background: white; border-radius: 12px; max-width: 480px; margin: 0 auto; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #111827; color: white; padding: 8px 12px; border-radius: 8px; font-weight: 900; font-size: 20px; letter-spacing: 2px;">
              SHOP<br/>ME
            </div>
          </div>
          <h2 style="color: #111827; font-size: 20px; font-weight: bold; text-align: center; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Hi there,</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">
            You requested to reset your ShopMe account password. Use this verification code:
          </p>
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px 24px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111827;">${otpCode}</span>
          </div>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">
            This code expires in 10 minutes.
          </p>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-top: 32px;">
            If you didn't request this, ignore this email. Your password will remain unchanged.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            &copy; ${new Date().getFullYear()} ShopMe. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export const sendPasswordResetConfirmation = async (email) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"ShopMe" <noreply@shopme.com>',
    to: email,
    subject: "ShopMe — Your password has been changed",
    html: `
      <div style="background-color: #f9fafb; padding: 40px 20px; font-family: sans-serif;">
        <div style="background: white; border-radius: 12px; max-width: 480px; margin: 0 auto; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background-color: #111827; color: white; padding: 8px 12px; border-radius: 8px; font-weight: 900; font-size: 20px; letter-spacing: 2px;">
              SHOP<br/>ME
            </div>
          </div>
          <h2 style="color: #111827; font-size: 20px; font-weight: bold; text-align: center; margin-top: 0;">Password Successfully Changed</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Hi there,</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">
            This is a confirmation that the password for your ShopMe account has just been changed.
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">
            Time of change: <strong>${new Date().toUTCString()}</strong>
          </p>
          <p style="color: #ef4444; font-size: 14px; font-weight: 500; line-height: 1.5; margin-top: 24px;">
            If you did not make this change, please contact our support team immediately to secure your account.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            &copy; ${new Date().getFullYear()} ShopMe. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};
