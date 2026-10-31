# ProofNest — setup notes
## First administrator
Sign up normally, then in Cloud → Database run once:
`insert into public.user_roles (user_id, role) select id, 'admin' from auth.users where email = 'you@example.com';`
No public form can grant admin.
## Payments (not configured)
Choose a provider that legally supports your merchant country, then add secrets PAYMENT_PROVIDER, PAYMENT_SECRET_KEY, PAYMENT_WEBHOOK_SECRET and implement signature verification in the webhook route. Until then the app runs in Free mode and shows payments as unavailable.
## Emails
Auth emails (signup confirmation, password reset) are sent by Lovable Cloud. Testimonial notifications need a sender domain — not configured yet.
