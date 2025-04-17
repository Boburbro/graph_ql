# Using Gmail for Email Verification

This guide explains how to set up Gmail to send verification emails from your Todo + Chat GraphQL application.

## Step 1: Create or Use an Existing Gmail Account

You can use your personal Gmail account, but it's recommended to create a separate account for your application.

## Step 2: Enable "Less Secure Apps" or Use App Passwords (Recommended)

Google has phased out the "Less Secure Apps" option for most accounts. Instead, you should:

1. **Enable 2-Step Verification**:
   - Go to your [Google Account](https://myaccount.google.com/).
   - Select "Security" from the left menu.
   - Under "Signing in to Google," select "2-Step Verification" and follow the steps.

2. **Create an App Password**:
   - After enabling 2-Step Verification, go back to the Security page.
   - Under "Signing in to Google," select "App passwords" (you might need to sign in again).
   - At the bottom, click "Select app" and choose "Other (Custom name)".
   - Enter a name for your app (e.g., "Todo Chat App").
   - Click "Generate".
   - Google will display a 16-character password. **Save this password** as you'll need it for your application.
   - Click "Done".

## Step 3: Update Your .env File

Update your `.env` file with the following settings:

```
# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="Todo Chat App <your-gmail@gmail.com>"
```

Replace:
- `your-gmail@gmail.com` with your Gmail address
- `your-app-password` with the 16-character app password you generated

## Step 4: Test Email Verification

1. Start your application:
   ```bash
   npm run dev
   ```

2. Register a new user via the GraphQL API:
   ```graphql
   mutation {
     register(
       email: "test@example.com",
       password: "password123",
       username: "testuser"
     ) {
       success
       message
     }
   }
   ```

3. You should see confirmation in the server logs that the email was sent.
4. The verification email should be delivered to the specified email address.

## Troubleshooting

If you encounter issues:

1. **Check server logs** for specific error messages.
2. Verify your Gmail account's **app password** is entered correctly.
3. Ensure your Gmail account doesn't have additional security restrictions.
4. Check your email **sending limits** (Gmail limits to 500 emails per day for regular accounts).
5. If emails are not being delivered, check your **spam folder**.

## Gmail Limitations

Be aware of these Gmail limitations:

- **Daily sending limit**: Free Gmail accounts can send up to 500 emails per 24 hours.
- **Rate limits**: Gmail may temporarily restrict your account if you send too many emails too quickly.

For production applications with high volume, consider using dedicated email service providers like SendGrid, Mailgun, or Amazon SES. 