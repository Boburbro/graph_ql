const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'assoftuz@gmail.com',
        pass: 'goje kwnw xvdm qhug'
    },
    tls: {
        rejectUnauthorized: false,
        minVersion: "TLSv1.2"
    },
    debug: true,
    logger: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
});

// Test email
async function testEmail() {
    try {
        console.log('Verifying SMTP connection...');
        const verify = await transporter.verify();
        console.log('SMTP connection verified:', verify);
        
        console.log('Attempting to send test email...');
        const result = await transporter.sendMail({
            from: '"Todo Chat App" <assoftuz@gmail.com>',
            to: "assoftuz@gmail.com",
            subject: "Test Email",
            text: "If you receive this, the email configuration is working!"
        });
        
        console.log('Message sent successfully!');
        console.log('Message ID:', result.messageId);
    } catch (error) {
        console.error('Error details:', {
            code: error.code,
            command: error.command,
            message: error.message,
            stack: error.stack
        });
    }
}

console.log('Starting email test...');
testEmail(); 