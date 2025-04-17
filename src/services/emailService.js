const nodemailer = require('nodemailer');

// Create a transporter for email sending
let transporter;

async function setupTransporter() {
    // Check if Gmail configuration is available
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        // Use Gmail with enhanced configuration
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
            requireTLS: true,
            tls: {
                rejectUnauthorized: false,
                minVersion: "TLSv1.2"
            },
            // Add connection timeout settings
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000,   // 10 seconds
            socketTimeout: 15000,     // 15 seconds
            // Add debug for troubleshooting
            debug: true,
            logger: true,
            // Add retry configuration
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateDelta: 1000,
            rateLimit: 5
        });

        // Verify connection configuration
        try {
            await transporter.verify();
            console.log(`Email service configured successfully with ${process.env.EMAIL_HOST} for ${process.env.EMAIL_USER}`);
        } catch (error) {
            console.error('Failed to verify email configuration:', error);
            throw error;
        }
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

// Send verification email with retries
async function sendVerificationEmail(email, verificationCode, retryCount = 3) {
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
        console.log('Attempting to send verification email...');
        const info = await transporter.sendMail(mailOptions);

        // For development with Ethereal
        if (!process.env.EMAIL_HOST) {
            console.log('Verification email sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        } else {
            console.log('Verification email sent to %s with Gmail', email);
            console.log('Message ID:', info.messageId);
        }

        return info;
    } catch (error) {
        console.error('Error details:', {
            code: error.code,
            command: error.command,
            message: error.message,
            stack: error.stack
        });

        // Retry logic
        if (retryCount > 0) {
            console.log(`Retrying... ${retryCount} attempts remaining`);
            // Wait for 2 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 2000));
            return sendVerificationEmail(email, verificationCode, retryCount - 1);
        }

        throw error;
    }
}

module.exports = {
    setupTransporter,
    generateVerificationCode,
    sendVerificationEmail,
}; 