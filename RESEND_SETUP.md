# Castaneda Strings Resend Setup

This build sends inquiry forms through the Vercel serverless function at:

`/api/send-inquiry`

## Required Vercel Environment Variables

Add these in Vercel → Project → Settings → Environment Variables:

```txt
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
INQUIRY_TO_EMAIL=eli@example.com,rebecca@example.com
RESEND_FROM_EMAIL=Castaneda Strings <inquiries@castanedastrings.com>
```

## Notes

- `RESEND_API_KEY` comes from Resend → API Keys.
- `INQUIRY_TO_EMAIL` is where form submissions are delivered. Use comma-separated emails for multiple recipients, like `eli@example.com,rebecca@example.com`.
- Optional: `INQUIRY_CC_EMAILS` and `INQUIRY_BCC_EMAILS` also support comma-separated emails.
- `RESEND_FROM_EMAIL` should use a verified Resend domain for production.
- Until the domain is verified, you can temporarily use:

```txt
RESEND_FROM_EMAIL=Castaneda Strings <onboarding@resend.dev>
```

After adding or changing environment variables, redeploy the Vercel project.
