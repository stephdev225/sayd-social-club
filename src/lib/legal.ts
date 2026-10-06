import { site } from "./site";

type Section = { h: string; p: string[] };

/**
 * Plain-language drafts. To be reviewed by Sayd (and ideally a lawyer) before going live:
 * they describe what the code actually does, not a legal opinion.
 */
export const privacy: Record<"fr" | "en", { updated: string; sections: Section[] }> = {
  fr: {
    updated: "Dernière mise à jour : 6 octobre 2026",
    sections: [
      { h: "Qui sommes-nous", p: [`${site.name}, organisateur de soirées à Québec. Pour toute question sur vos renseignements : ${site.email}.`] },
      {
        h: "Ce que nous recueillons",
        p: [
          "Quand vous achetez un billet : prénom, nom, courriel, téléphone si vous le donnez, billets achetés et montant payé.",
          "Quand vous écrivez via un formulaire : les informations que vous saisissez.",
          "Nous ne voyons jamais votre numéro de carte : le paiement est traité par Stripe.",
          "Visiteurs du site : mesure d'audience anonyme, sans cookie publicitaire et sans profil personnel.",
        ],
      },
      {
        h: "Pourquoi",
        p: [
          "Émettre et vérifier vos billets à l'entrée, vous envoyer votre confirmation, répondre à vos messages, tenir nos registres comptables.",
          "Vous envoyer nos annonces seulement si vous avez coché la case prévue. Vous pouvez vous désinscrire à tout moment.",
        ],
      },
      {
        h: "Avec qui nous les partageons",
        p: [
          "Stripe (paiement), Google Firebase (hébergement de la base de données), Vercel (hébergement du site), Brevo (envoi des courriels). Ces services peuvent stocker des données hors du Québec.",
          "Nous ne vendons pas vos renseignements.",
        ],
      },
      { h: "Combien de temps", p: ["Les données d'achat sont conservées le temps requis par nos obligations comptables et fiscales, puis supprimées."] },
      { h: "Vos droits", p: [`Vous pouvez demander l'accès, la correction ou la suppression de vos renseignements en écrivant à ${site.email}.`] },
    ],
  },
  en: {
    updated: "Last updated: October 6, 2026",
    sections: [
      { h: "Who we are", p: [`${site.name}, a party organiser in Québec City. Questions about your information: ${site.email}.`] },
      {
        h: "What we collect",
        p: [
          "When you buy a ticket: first name, last name, email, phone if you give it, tickets bought and amount paid.",
          "When you write through a form: what you type in.",
          "We never see your card number: payment is handled by Stripe.",
          "Site visitors: anonymous audience measurement, no advertising cookies and no personal profile.",
        ],
      },
      {
        h: "Why",
        p: [
          "To issue your tickets and check them at the door, send your confirmation, answer your messages and keep our accounting records.",
          "To send our announcements only if you ticked the box. You can unsubscribe at any time.",
        ],
      },
      {
        h: "Who we share it with",
        p: [
          "Stripe (payment), Google Firebase (database hosting), Vercel (site hosting), Brevo (email delivery). These services may store data outside Québec.",
          "We don't sell your information.",
        ],
      },
      { h: "How long", p: ["Purchase data is kept as long as our accounting and tax obligations require, then deleted."] },
      { h: "Your rights", p: [`You can ask to access, correct or delete your information by writing to ${site.email}.`] },
    ],
  },
};

export const terms: Record<"fr" | "en", { updated: string; sections: Section[] }> = {
  fr: {
    updated: "Dernière mise à jour : 6 octobre 2026",
    sections: [
      { h: "Prix", p: ["Les prix sont affichés en dollars canadiens, avant taxes. La TPS (5 %) et la TVQ (9,975 %) sont ajoutées au paiement. Le prix à la porte peut être plus élevé que le prix en ligne."] },
      { h: "Billets", p: ["Chaque billet porte un code QR unique, valable pour une seule entrée. Un code déjà scanné est refusé. Ne partagez pas vos billets."] },
      { h: "Aucun remboursement", p: ["Les billets ne sont ni remboursables ni échangeables, sauf annulation de l'événement par Sayd Social Club."] },
      { h: "Entrée", p: ["L'organisateur et le lieu peuvent refuser l'entrée, notamment en cas de non-respect du code vestimentaire annoncé, de comportement inapproprié ou si l'âge légal n'est pas atteint. Une pièce d'identité peut être demandée."] },
      { h: "Annulation par l'organisateur", p: ["Si un événement est annulé, les détenteurs de billets sont remboursés du prix payé."] },
      { h: "Contact", p: [`${site.email} — ${site.phone}`] },
    ],
  },
  en: {
    updated: "Last updated: October 6, 2026",
    sections: [
      { h: "Prices", p: ["Prices are in Canadian dollars, before tax. GST (5%) and QST (9.975%) are added at checkout. The door price may be higher than the online price."] },
      { h: "Tickets", p: ["Each ticket has a unique QR code valid for one entry. A code that has already been scanned is refused. Don't share your tickets."] },
      { h: "No refunds", p: ["Tickets are non-refundable and non-exchangeable, unless Sayd Social Club cancels the event."] },
      { h: "Entry", p: ["The organiser and the venue may refuse entry, including for not following the announced dress code, inappropriate behaviour, or being under the legal age. ID may be requested."] },
      { h: "Cancellation by the organiser", p: ["If an event is cancelled, ticket holders are refunded the price paid."] },
      { h: "Contact", p: [`${site.email} — ${site.phone}`] },
    ],
  },
};
