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

## Optional Email Recipients

```txt
INQUIRY_CC_EMAILS=planner@example.com
INQUIRY_BCC_EMAILS=archive@example.com
```

All recipient fields support comma-separated email addresses.

## Lead Source Tracking

This build captures UTM tags, referral codes, in-app browser context, referrer, landing page, and current page.

Use these link formats when sending links from different places:

```txt
Instagram bio:
https://castanedastrings.com/?utm_source=instagram&utm_medium=bio&utm_campaign=wedding_inquiry

Instagram DM:
https://castanedastrings.com/?utm_source=instagram&utm_medium=dm&utm_campaign=wedding_inquiry

Instagram Story:
https://castanedastrings.com/?utm_source=instagram&utm_medium=story&utm_campaign=wedding_inquiry

Facebook DM:
https://castanedastrings.com/?utm_source=facebook&utm_medium=dm&utm_campaign=wedding_inquiry

Planner referral:
https://castanedastrings.com/?utm_source=referral&utm_medium=planner&utm_campaign=wedding_inquiry&ref=planner_lauren

Friend referral:
https://castanedastrings.com/?utm_source=referral&utm_medium=word_of_mouth&utm_campaign=wedding_inquiry&ref=friend_maria
```

Supported referral-code parameters:

```txt
ref=
referral=
referral_code=
code=
promo=
partner=
```

Supported DM shortcuts:

```txt
?dm=instagram
?dm=facebook
?utm_source=instagram&utm_medium=dm
```

The inquiry email will show:

- Form Location
- Lead Source
- Lead Medium
- Message Channel
- Referral Code
- Campaign
- Content / Placement
- Browser Context
- Referrer
- Landing Page
- Current Page

## Notes

- `RESEND_API_KEY` comes from Resend → API Keys.
- `INQUIRY_TO_EMAIL` is where form submissions are delivered.
- `RESEND_FROM_EMAIL` should use a verified Resend domain for production.
- Until the domain is verified, you can temporarily use:

```txt
RESEND_FROM_EMAIL=Castaneda Strings <onboarding@resend.dev>
```

After adding or changing environment variables, redeploy the Vercel project.
