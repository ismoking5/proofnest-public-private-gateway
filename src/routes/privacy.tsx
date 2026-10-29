import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

const content = {
  en: { title: "Privacy Policy", updated: "Last updated: October 2026", sections: [
    { h: "Data we collect", p: "Account data (name, email, language), project data you create, and testimonials submitted by your customers (display name, optional email, company, website, rating, text and consent)." },
    { h: "How we use it", p: "To provide the service, display approved testimonials, enforce plan limits and secure the platform. We do not sell personal data." },
    { h: "Customer emails", p: "Emails submitted with testimonials are private. They are visible only to the project owner and are never shown on public pages or widgets." },
    { h: "Analytics", p: "We count public page and widget views without storing visitor IP addresses or personal identifiers." },
    { h: "Payments", p: "Card and banking details are handled exclusively by our payment provider. ProofNest never stores card numbers." },
    { h: "Your rights", p: "You can access, correct or delete your data from your settings or by contacting us. Testimonial authors can request removal from the project owner or from us." },
  ]},
  fr: { title: "Politique de confidentialité", updated: "Dernière mise à jour : octobre 2026", sections: [
    { h: "Données collectées", p: "Données de compte (nom, e-mail, langue), données des projets que vous créez et témoignages soumis par vos clients (nom affiché, e-mail facultatif, entreprise, site, note, texte et consentement)." },
    { h: "Utilisation", p: "Pour fournir le service, afficher les témoignages approuvés, appliquer les limites des offres et sécuriser la plateforme. Nous ne vendons pas de données personnelles." },
    { h: "E-mails des clients", p: "Les e-mails transmis avec les témoignages sont privés. Ils ne sont visibles que par le propriétaire du projet et jamais affichés publiquement." },
    { h: "Statistiques", p: "Nous comptons les vues des pages publiques et widgets sans stocker l'adresse IP ni d'identifiant personnel des visiteurs." },
    { h: "Paiements", p: "Les données de carte et bancaires sont traitées exclusivement par notre prestataire de paiement. ProofNest ne stocke jamais de numéro de carte." },
    { h: "Vos droits", p: "Vous pouvez accéder à vos données, les corriger ou les supprimer depuis vos paramètres ou en nous contactant. Les auteurs de témoignages peuvent demander leur retrait." },
  ]},
};

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [
    { title: "Privacy Policy — ProofNest" }, { name: "description", content: "How ProofNest collects and protects personal data." },
    { property: "og:title", content: "Privacy Policy — ProofNest" }, { property: "og:description", content: "How ProofNest collects and protects personal data." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ]}),
  component: () => <LegalPage content={content} />,
});
