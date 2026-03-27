import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
});

export const sendOTP = async (email, otp) => {
    try {
        // Simulation mode check: if no credentials provided, just log to console
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log('\n----------------------------------------');
            console.log('  SIMULATED EMAIL SENDING (Missing SMTP credentials)');
            console.log(`  To:      ${email}`);
            console.log(`  OTP:     ${otp}`);
            console.log('----------------------------------------\n');
            return true;
        }

        const mailOptions = {

            from: `"SmartTaxi System" <${process.env.FROM_EMAIL || 'no-reply@smarttaxi.com'}>`,
            to: email,
            subject: 'Driver Verification OTP - SmartTaxi',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #0f172a; text-align: center;">Driver Verification</h2>
                    <p>Hello,</p>
                    <p>You are being registered as a driver on the <strong>SmartTaxi</strong> platform. Please use the following One-Time Password (OTP) to verify your account:</p>
                    <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a; border-radius: 8px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="color: #64748b; font-size: 14px;">This OTP is valid for 10 minutes. If you did not expect this email, please ignore it.</p>
                    <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    <p style="text-align: center; color: #94a3b8; font-size: 12px;">© 2026 SmartTaxi Management Systems</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP Email sent: %s', info.messageId);

        // Return preview URL for ethereal.email (helpful for dev)
        if (info.host === 'smtp.ethereal.email') {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }

        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
};
