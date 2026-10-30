import { createFileRoute } from "@tanstack/react-router";

// Payment webhook placeholder. No provider is integrated yet: this endpoint refuses every
// request so nothing can activate a paid plan. When a provider is chosen, verify its
// signature here, insert into payment_events (unique provider+provider_event_id gives
// idempotency), then update subscriptions with the admin client.
export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async () => new Response(JSON.stringify({ error: "Payments not configured" }), { status: 503, headers: { "content-type": "application/json" } }),
    },
  },
});
