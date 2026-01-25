# Supabase Email Confirmation Template

This is the email confirmation template for Supabase Auth. Use this in your Supabase dashboard under **Authentication > Email Templates > Confirm signup**.

## Template Configuration

**Subject:** `Confirm your email for Pennywise Coach`

**Body (HTML):**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Plus Jakarta Sans', system-ui, sans-serif; background-color: #F5F5F5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F5F5F5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #E0E0E0;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #1A1A1A; background: linear-gradient(to right, #4A90E2, #4A90E2CC); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                Pennywise Coach
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #1A1A1A;">
                Welcome! Let's confirm your email
              </h2>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #6B7280;">
                Thanks for signing up for Pennywise Coach! We're excited to help you build healthier money habits with clear, supportive guidance.
              </p>
              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #6B7280;">
                Please confirm your email address by clicking the button below. This helps us keep your account secure.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 0 0 32px;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 14px 32px; background-color: #4A90E2; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(74, 144, 226, 0.2);">
                      Confirm Email Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative Link -->
              <p style="margin: 0 0 8px; font-size: 14px; color: #6B7280;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 32px; font-size: 12px; word-break: break-all; color: #4A90E2;">
                {{ .ConfirmationURL }}
              </p>
              
              <!-- Trust Indicators -->
              <div style="padding: 24px; background-color: #FAFAFA; border-radius: 8px; border: 1px solid #E0E0E0;">
                <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #1A1A1A;">
                  What's next?
                </p>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #6B7280;">
                  <li>Complete your financial profile</li>
                  <li>Get personalized spending insights</li>
                  <li>Receive gentle, supportive coaching</li>
                </ul>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; border-top: 1px solid #E0E0E0; background-color: #FAFAFA;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #6B7280;">
                If you didn't create an account with Pennywise Coach, you can safely ignore this email.
              </p>
              <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                © 2025 Pennywise Coach. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Plain Text Version (Optional)

For better email client compatibility, you can also provide a plain text version:

```
Welcome to Pennywise Coach!

Thanks for signing up! We're excited to help you build healthier money habits with clear, supportive guidance.

Please confirm your email address by clicking the link below:
{{ .ConfirmationURL }}

What's next?
- Complete your financial profile
- Get personalized spending insights
- Receive gentle, supportive coaching

If you didn't create an account with Pennywise Coach, you can safely ignore this email.

© 2025 Pennywise Coach. All rights reserved.
```

## Setup Instructions

1. Go to your Supabase Dashboard
2. Navigate to **Authentication > Email Templates**
3. Select **Confirm signup** template
4. Set the **Subject** to: `Confirm your email for Pennywise Coach`
5. Paste the HTML template above into the **Body** field
6. Save the template

## Customization Notes

- **Colors**: Uses app theme colors (primary blue #4A90E2, background #FFFFFF, muted gray #6B7280)
- **Font**: Uses system fonts with Plus Jakarta Sans as preferred
- **Branding**: Gradient text effect on brand name matches landing page
- **Responsive**: Works well on mobile and desktop email clients

## Testing

After setting up the template:
1. Sign up a new user
2. Check the confirmation email
3. Verify the styling and links work correctly
4. Test on different email clients (Gmail, Outlook, Apple Mail)
