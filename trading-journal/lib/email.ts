import nodemailer from "nodemailer";

export async function sendApprovalRequestEmail({
  userEmail,
  userName,
  approvalToken
}: {
  userEmail: string;
  userName: string;
  approvalToken: string;
}) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL ?? "draga4lifee@gmail.com";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!gmailUser || !gmailPass) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailPass }
  });

  const approveUrl = `${appUrl}/api/admin/approve?token=${approvalToken}`;

  await transporter.sendMail({
    from: `"Brotherhood Journal" <${gmailUser}>`,
    to: adminEmail,
    subject: `New signup waiting for approval: ${userName}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2 style="color:#d4a017">New Account Request</h2>
        <p><strong>Name:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <br/>
        <a href="${approveUrl}" style="background:#d4a017;color:#000;padding:14px 28px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;font-size:16px;">
          ✅ Approve Account
        </a>
        <p style="color:#666;font-size:13px;margin-top:20px">Or copy: ${approveUrl}</p>
      </div>
    `
  });
}
