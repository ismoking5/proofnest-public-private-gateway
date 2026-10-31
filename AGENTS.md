<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Plan limits, consent and moderation rules are enforced in Postgres triggers/SECURITY DEFINER RPCs, never only in UI — why: frontend checks can be bypassed.
- Public pages, collection form and widget iframe read/write only via RPCs (get_public_page, submit_testimonial, record_view) through server functions in src/lib/public.functions.ts — why: anon never touches tables directly, so private emails/pending rows stay hidden.
- Dashboard CRUD uses the browser client under RLS; admin work goes through src/lib/admin.functions.ts which verifies has_role before using the admin client.
- Paid plans activate only from a verified payment webhook (src/routes/api/public/payments/webhook.ts, currently refusing all); never from a success URL.
- UI strings live in src/lib/locales/*.ts (en is the source type); add languages by adding a file and registering it in src/lib/i18n.tsx.
