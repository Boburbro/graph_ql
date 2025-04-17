const nodemailer = require('nodemailer');

// Create a transporter for email sending
let transporter;

async function setupTransporter() {
    // Check if Gmail configuration is available
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        // Use Gmail
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
        
        console.log(`Email service configured with ${process.env.EMAIL_HOST} for ${process.env.EMAIL_USER}`);
    } else {
        // For development - use ethereal.email (fake SMTP service)
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log('Development email account created:', testAccount.user);
        console.log('Preview emails at: https://ethereal.email');
    }
}

// Generate verification code
function generateVerificationCode() {
    // Generate a 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
async function sendVerificationEmail(email, verificationCode) {
    if (!transporter) {
        await setupTransporter();
    }

    const mailOptions = {
        from: process.env.EMAIL_FROM || '"Todo Chat App" <verification@todochat.com>',
        to: email,
        subject: 'Verify your email address',
        text: `Your verification code is: ${verificationCode}. This code will expire in 30 minutes.`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3498db;">Todo Chat App - Email Verification</h2>
        <p>Thanks for signing up! Please verify your email address to complete your registration.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <h3 style="margin: 0; font-size: 24px;">${verificationCode}</h3>
        </div>
        <p>This verification code will expire in 30 minutes.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        
        // For development with Ethereal
        if (!process.env.EMAIL_HOST) {
            console.log('Verification email sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        } else {
            console.log('Verification email sent to %s with Gmail', email);
        }
        
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

module.exports = {
    setupTransporter,
    generateVerificationCode,
    sendVerificationEmail,
}; 