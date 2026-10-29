import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

const content = {
  en: { title: "Terms of Service", updated: "Last updated: October 2026", sections: [
    { h: "1. Service", p: "ProofNest provides tools to collect, moderate and display customer testimonials. By creating an account you agree to these terms." },
    { h: "2. Your account", p: "You are responsible for the security of your account and for all activity under it. You must provide accurate information." },
    { h: "3. Your content", p: "You remain the owner of your projects and the testimonials you collect. You must only publish testimonials for which the author has given explicit consent, and never publish fabricated reviews." },
    { h: "4. Acceptable use", p: "You may not use ProofNest to publish fake, misleading, illegal or abusive content, nor attempt to access data belonging to other users. We may suspend accounts that violate these rules." },
    { h: "5. Plans and payments", p: "Free and paid plans have usage limits described on the pricing page. Paid features are only activated after a payment is confirmed by our payment provider." },
    { h: "6. Liability", p: "The service is provided as is. To the extent permitted by law, ProofNest is not liable for indirect damages." },
    { h: "7. Changes", p: "We may update these terms. Material changes will be communicated in advance." },
  ]},
  fr: { title: "Conditions d'utilisation", updated: "Dernière mise à jour : octobre 2026", sections: [
    { h: "1. Service", p: "ProofNest fournit des outils pour collecter, modérer et afficher des témoignages clients. En créant un compte, vous acceptez ces conditions." },
    { h: "2. Votre compte", p: "Vous êtes responsable de la sécurité de votre compte et de toute activité qui y est réalisée. Vous devez fournir des informations exactes." },
    { h: "3. Votre contenu", p: "Vous restez propriétaire de vos projets et des témoignages collectés. Vous ne devez publier que des témoignages dont l'auteur a donné son consentement explicite, et jamais de faux avis." },
    { h: "4. Utilisation acceptable", p: "Il est interdit d'utiliser ProofNest pour publier des contenus faux, trompeurs, illégaux ou abusifs, ou de tenter d'accéder aux données d'autres utilisateurs. Nous pouvons suspendre les comptes en infraction." },
    { h: "5. Offres et paiements", p: "Les offres gratuites et payantes comportent les limites décrites sur la page Tarifs. Les fonctionnalités payantes ne sont activées qu'après confirmation du paiement par notre prestataire." },
    { h: "6. Responsabilité", p: "Le service est fourni en l'état. Dans les limites permises par la loi, ProofNest n'est pas responsable des dommages indirects." },
    { h: "7. Modifications", p: "Nous pouvons mettre à jour ces conditions. Les changements importants seront communiqués à l'avance." },
  ]},
};

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [
    { title: "Terms of Service — ProofNest" }, { name: "description", content: "Terms governing the use of ProofNest." },
    { property: "og:title", content: "Terms of Service — ProofNest" }, { property: "og:description", content: "Terms governing the use of ProofNest." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ]}),
  component: () => <LegalPage content={content} />,
});
