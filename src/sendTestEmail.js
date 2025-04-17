require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendTestEmail() {
    // Create the transporter with the same config as in emailService.js
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // Email options
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: 'boburotaboyev0@gmail.com',
        subject: 'Test Email from Todo Chat App',
        text: 'This is a test email from the Todo Chat application.',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3498db;">Todo Chat App - Test Email</h2>
        <p>This is a test email from the Todo Chat application.</p>
        <p>If you received this, the email configuration is working correctly!</p>
      </div>
    `,
    };

    try {
        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending test email:', error);
        throw error;
    }
}

// Run the function
sendTestEmail()
    .then(() => console.log('Email sending process completed'))
    .catch(error => console.error('Failed to send email:', error)); 