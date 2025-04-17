const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'assoftuz@gmail.com',
        pass: 'goje kwnw xvdm qhug'
    },
    debug: true // Enable debug logs
});

// Test email
async function testEmail() {
    try {
        const info = await transporter.verify();
        console.log('Server is ready to take our messages');

        // Try to send test email
        const result = await transporter.sendMail({
            from: '"Todo Chat App" <assoftuz@gmail.com>',
            to: "assoftuz@gmail.com",
            subject: "Test Email",
            text: "If you receive this, the email configuration is working!"
        });

        console.log('Message sent: %s', result.messageId);
    } catch (error) {
        console.error('Error:', error);
    }
}

testEmail(); 