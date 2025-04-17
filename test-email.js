const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: '142.250.102.108', // Direct IP for smtp.gmail.com
    port: 587,
    secure: false,
    requireTLS: true,
    name: 'smtp.gmail.com', // Required when using direct IP
    auth: {
        user: 'assoftuz@gmail.com',
        pass: 'goje kwnw xvdm qhug'
    },
    tls: {
        rejectUnauthorized: false,
        minVersion: "TLSv1.2",
        servername: 'smtp.gmail.com' // SNI for TLS
    },
    debug: true,
    logger: true,
    connectionTimeout: 30000, // Increased timeout to 30 seconds
    greetingTimeout: 30000,
    socketTimeout: 30000
});

// Test email
async function testEmail() {
    try {
        console.log('Starting with configuration:', {
            host: transporter.options.host,
            port: transporter.options.port,
            secure: transporter.options.secure,
            user: transporter.options.auth.user
        });

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
            stack: error.stack,
            errorInfo: error.response
        });
    }
}

console.log('Starting email test...');
testEmail(); 