import { site } from "./site";

type Section = { h: string; p: string[] };

/**
 * Plain-language drafts. To be reviewed by Sayd (and ideally a lawyer) before going live:
 * they describe what the code actually does, not a legal opinion.
 */
export const privacy: Record<"fr" | "en", { updated: string; sections: Section[] }> = {
  fr: {
    updated: "Dernière mise à jour : 16 octobre 2026",
    sections: [
      {
        h: "En bref",
        p: [
          `${site.name} organise des soirées et des day parties afro-caribéennes à Québec. Cette politique explique quels renseignements personnels nous recueillons sur saydsocialclub.com, pourquoi nous les recueillons, avec qui nous les partageons, combien de temps nous les gardons et quels sont vos droits.`,
          "Elle respecte la Loi sur la protection des renseignements personnels dans le secteur privé du Québec, telle que modifiée par la Loi 25. Nous recueillons le moins de renseignements possible et nous ne les vendons jamais.",
        ],
      },
      {
        h: "Responsable de la protection des renseignements personnels",
        p: [`La personne responsable de la protection des renseignements personnels chez ${site.name} veille à l'application de cette politique et répond à toutes vos questions et demandes. Vous pouvez la joindre à ${site.email}.`],
      },
      {
        h: "Les renseignements que nous recueillons",
        p: [
          "Nous recueillons uniquement ce que vous choisissez de nous transmettre par les formulaires du site :",
          "• « Me prévenir » (annonces des soirées) : votre adresse courriel, votre prénom si vous le donnez, la langue du site et la page où vous vous êtes inscrit.",
          "• Contact : votre nom, votre courriel, le sujet choisi et votre message.",
          "• Candidature ambassadeur : votre nom, votre courriel, votre téléphone, votre compte Instagram si vous le donnez et votre message.",
          "• Proposition de partenariat : le nom de votre entreprise, votre nom, votre courriel, votre téléphone si vous le donnez, le type de partenariat et votre message.",
          "Comme tout site Web, notre hébergeur enregistre aussi des données techniques de connexion (adresse IP, type de navigateur, page demandée, date et heure). Elles servent uniquement à faire fonctionner le site et à le protéger contre les abus.",
          "Nous ne vous demandons jamais de créer un compte et nous ne recueillons aucun renseignement sensible (santé, origine, opinions, etc.).",
        ],
      },
      {
        h: "Billets",
        p: [
          "Les billets de nos soirées sont vendus par notre billetterie partenaire, Le Point de Vente. Lorsque vous achetez un billet, vos renseignements d'achat et de paiement sont recueillis et traités directement par ce service, selon sa propre politique de confidentialité. Nous ne voyons jamais votre numéro de carte.",
          "Nous pouvons recevoir de la billetterie les renseignements nécessaires à l'accueil des participants à l'entrée (par exemple le nom et le type de billet).",
        ],
      },
      {
        h: "Pourquoi nous les utilisons",
        p: [
          "• Répondre à vos messages et à vos demandes.",
          "• Vous prévenir de nos prochaines soirées, seulement si vous vous êtes inscrit.",
          "• Étudier les candidatures d'ambassadeurs et les propositions de partenariat.",
          "• Assurer la sécurité du site et prévenir les envois abusifs.",
          "• Respecter nos obligations légales.",
          "Nous n'utilisons pas vos renseignements à d'autres fins sans vous demander d'abord votre consentement.",
        ],
      },
      {
        h: "Votre consentement",
        p: [
          "En envoyant un formulaire, vous consentez à ce que nous utilisions les renseignements transmis pour la raison indiquée sur ce formulaire.",
          `Vous pouvez retirer votre consentement à tout moment : chaque courriel d'annonce contient un lien de désinscription, et vous pouvez aussi nous écrire à ${site.email}.`,
        ],
      },
      {
        h: "Témoins (cookies) et mesure d'audience",
        p: [
          "Le site n'utilise aucun témoin publicitaire et aucun outil de suivi d'une page à l'autre ou d'un site à l'autre.",
          "Il dépose un seul témoin fonctionnel, « sayd_lang », qui retient la langue que vous avez choisie (français ou anglais) pendant 12 mois. L'espace réservé à notre équipe utilise en plus un témoin de session sécurisé, valable 12 heures.",
          "Aucun outil de mesure d'audience n'est installé à ce jour. Si nous en ajoutons un, il sera anonyme et cette politique sera mise à jour avant son activation.",
        ],
      },
      {
        h: "Avec qui nous les partageons",
        p: [
          "Seules les personnes de notre équipe qui en ont besoin ont accès à vos renseignements. Nous faisons aussi appel à quelques fournisseurs, qui ne peuvent les utiliser que pour nous rendre leur service :",
          "• Vercel : hébergement du site (serveurs aux États-Unis).",
          "• Google Cloud / Firebase : base de données où sont enregistrés les formulaires (serveurs à Montréal).",
          "• Brevo : envoi de nos courriels, lorsque ce service est activé.",
          "• Le Point de Vente : vente des billets.",
          "Lorsque des renseignements sont hébergés à l'extérieur du Québec, nous nous assurons au préalable qu'ils bénéficient d'une protection adéquate, comme l'exige la loi.",
          "Nous ne vendons, ne louons et n'échangeons jamais vos renseignements personnels.",
        ],
      },
      {
        h: "Combien de temps nous les gardons",
        p: [
          "• Inscription aux annonces : jusqu'à votre désinscription.",
          "• Messages de contact, candidatures et propositions de partenariat : 24 mois après notre dernier échange.",
          "• Données techniques de connexion : quelques jours à quelques semaines, selon notre hébergeur.",
          "À la fin de ces délais, les renseignements sont supprimés ou rendus anonymes.",
        ],
      },
      {
        h: "Comment nous les protégeons",
        p: [
          "Le site est servi uniquement en connexion chiffrée (HTTPS). La base de données n'est accessible qu'à partir de notre serveur, jamais directement depuis un navigateur. L'espace de gestion est protégé par mot de passe et réservé à notre équipe. Les formulaires sont protégés contre les envois automatisés.",
          "Si un incident de confidentialité présentait un risque de préjudice sérieux, nous en aviserions la Commission d'accès à l'information et les personnes concernées, comme le prévoit la loi.",
        ],
      },
      {
        h: "Photos et vidéos de nos soirées",
        p: [
          "Nos soirées sont photographiées et filmées par nos photographes. Ces images peuvent être publiées sur ce site et sur nos réseaux sociaux pour faire connaître nos événements.",
          `Vous apparaissez sur une photo et souhaitez qu'elle soit retirée ? Écrivez-nous à ${site.email} en indiquant la photo : nous la retirerons de notre site et de nos comptes dans les meilleurs délais.`,
        ],
      },
      {
        h: "Personnes mineures",
        p: ["Nos soirées sont réservées aux personnes majeures. Le site ne s'adresse pas aux personnes de moins de 14 ans et nous ne recueillons pas sciemment leurs renseignements."],
      },
      {
        h: "Vos droits",
        p: [
          "Vous pouvez à tout moment :",
          "• demander à savoir quels renseignements nous détenons sur vous et en obtenir une copie;",
          "• faire corriger un renseignement inexact ou incomplet;",
          "• retirer votre consentement ou demander la suppression de vos renseignements;",
          "• demander que vos renseignements vous soient transmis dans un format technologique structuré et couramment utilisé.",
          `Écrivez-nous à ${site.email}. Nous répondons dans un délai de 30 jours. Si vous n'êtes pas satisfait de notre réponse, vous pouvez porter plainte auprès de la Commission d'accès à l'information du Québec (cai.gouv.qc.ca).`,
        ],
      },
      {
        h: "Modifications",
        p: ["Nous pouvons mettre à jour cette politique, par exemple si nous ajoutons un service. La date de la dernière mise à jour figure en haut de la page. En cas de changement important, nous l'indiquerons clairement sur le site."],
      },
      { h: "Nous joindre", p: [`${site.name} — ${site.email} — ${site.phone}`] },
    ],
  },
  en: {
    updated: "Last updated: October 16, 2026",
    sections: [
      {
        h: "In short",
        p: [
          `${site.name} hosts Afro-Caribbean parties and day parties in Québec City. This policy explains what personal information we collect on saydsocialclub.com, why, who we share it with, how long we keep it and what your rights are.`,
          "It complies with Québec's Act respecting the protection of personal information in the private sector, as amended by Law 25. We collect as little as possible and we never sell it.",
        ],
      },
      {
        h: "Person in charge of personal information",
        p: [`The person in charge of the protection of personal information at ${site.name} oversees this policy and answers all your questions and requests. Contact: ${site.email}.`],
      },
      {
        h: "What we collect",
        p: [
          "We only collect what you choose to send us through the site's forms:",
          "• “Notify me” (party announcements): your email address, your first name if you give it, the site language and the page where you signed up.",
          "• Contact: your name, email, chosen subject and message.",
          "• Ambassador application: your name, email, phone, Instagram account if you give it, and your message.",
          "• Partnership proposal: your company name, your name, email, phone if you give it, the type of partnership and your message.",
          "Like any website, our host also records technical connection data (IP address, browser type, page requested, date and time). It is used only to run the site and protect it from abuse.",
          "We never ask you to create an account and we collect no sensitive information (health, origin, opinions, etc.).",
        ],
      },
      {
        h: "Tickets",
        p: [
          "Tickets for our parties are sold by our ticketing partner, Le Point de Vente. When you buy a ticket, your purchase and payment information is collected and processed directly by that service, under its own privacy policy. We never see your card number.",
          "We may receive from the ticketing service the information needed to welcome guests at the door (for example the name and ticket type).",
        ],
      },
      {
        h: "Why we use it",
        p: [
          "• To answer your messages and requests.",
          "• To tell you about our next parties, only if you signed up.",
          "• To review ambassador applications and partnership proposals.",
          "• To keep the site secure and prevent abusive submissions.",
          "• To meet our legal obligations.",
          "We do not use your information for any other purpose without asking for your consent first.",
        ],
      },
      {
        h: "Your consent",
        p: [
          "By sending a form, you consent to our use of the information for the purpose stated on that form.",
          `You can withdraw your consent at any time: every announcement email has an unsubscribe link, and you can also write to ${site.email}.`,
        ],
      },
      {
        h: "Cookies and analytics",
        p: [
          "The site uses no advertising cookies and no cross-page or cross-site tracking.",
          "It sets a single functional cookie, “sayd_lang”, which remembers your language (French or English) for 12 months. Our team's private area also uses a secure session cookie, valid for 12 hours.",
          "No analytics tool is installed at this time. If we add one, it will be anonymous and this policy will be updated before it is turned on.",
        ],
      },
      {
        h: "Who we share it with",
        p: [
          "Only the members of our team who need it can access your information. We also rely on a few providers, who may use it only to provide their service to us:",
          "• Vercel: site hosting (servers in the United States).",
          "• Google Cloud / Firebase: database where forms are stored (servers in Montréal).",
          "• Brevo: sending our emails, when this service is enabled.",
          "• Le Point de Vente: ticket sales.",
          "When information is hosted outside Québec, we first make sure it receives adequate protection, as the law requires.",
          "We never sell, rent or trade your personal information.",
        ],
      },
      {
        h: "How long we keep it",
        p: [
          "• Announcement sign-ups: until you unsubscribe.",
          "• Contact messages, applications and partnership proposals: 24 months after our last exchange.",
          "• Technical connection data: a few days to a few weeks, depending on our host.",
          "After these periods, the information is deleted or anonymised.",
        ],
      },
      {
        h: "How we protect it",
        p: [
          "The site is served only over an encrypted connection (HTTPS). The database can be reached only from our server, never directly from a browser. The management area is password-protected and reserved for our team. Forms are protected against automated submissions.",
          "If a confidentiality incident posed a risk of serious injury, we would notify the Commission d'accès à l'information and the people concerned, as the law requires.",
        ],
      },
      {
        h: "Photos and videos at our parties",
        p: [
          "Our parties are photographed and filmed by our photographers. These images may be published on this site and on our social media to promote our events.",
          `You appear in a photo and would like it removed? Write to ${site.email} and tell us which photo: we will remove it from our site and accounts as quickly as possible.`,
        ],
      },
      {
        h: "Minors",
        p: ["Our parties are for adults only. The site is not intended for people under 14 and we do not knowingly collect their information."],
      },
      {
        h: "Your rights",
        p: [
          "At any time, you can:",
          "• ask what information we hold about you and get a copy;",
          "• have inaccurate or incomplete information corrected;",
          "• withdraw your consent or ask for your information to be deleted;",
          "• ask for your information in a structured, commonly used technological format.",
          `Write to ${site.email}. We answer within 30 days. If you are not satisfied with our answer, you can file a complaint with the Commission d'accès à l'information du Québec (cai.gouv.qc.ca).`,
        ],
      },
      {
        h: "Changes",
        p: ["We may update this policy, for example when we add a service. The date of the last update appears at the top of the page. Any significant change will be clearly indicated on the site."],
      },
      { h: "Contact us", p: [`${site.name} — ${site.email} — ${site.phone}`] },
    ],
  },
};

export const terms: Record<"fr" | "en", { updated: string; sections: Section[] }> = {
  fr: {
    updated: "Dernière mise à jour : 16 octobre 2026",
    sections: [
      { h: "Billets", p: ["Les billets sont vendus par notre billetterie partenaire, Le Point de Vente, selon ses propres conditions. Chaque billet porte un code unique, valable pour une seule entrée : un code déjà scanné est refusé. Ne partagez pas vos billets."] },
      { h: "Aucun remboursement", p: ["Les billets ne sont ni remboursables ni échangeables, sauf annulation de l'événement par Sayd Social Club."] },
      { h: "Entrée", p: ["L'organisateur et le lieu peuvent refuser l'entrée, notamment en cas de non-respect du code vestimentaire annoncé, de comportement inapproprié ou si l'âge légal n'est pas atteint. Une pièce d'identité peut être demandée."] },
      { h: "Annulation par l'organisateur", p: ["Si un événement est annulé, les détenteurs de billets sont remboursés du prix payé."] },
      { h: "Contact", p: [`${site.email} — ${site.phone}`] },
    ],
  },
  en: {
    updated: "Last updated: October 16, 2026",
    sections: [
      { h: "Tickets", p: ["Tickets are sold by our ticketing partner, Le Point de Vente, under its own terms. Each ticket has a unique code valid for one entry: a code that has already been scanned is refused. Don't share your tickets."] },
      { h: "No refunds", p: ["Tickets are non-refundable and non-exchangeable, unless Sayd Social Club cancels the event."] },
      { h: "Entry", p: ["The organiser and the venue may refuse entry, including for not following the announced dress code, inappropriate behaviour, or being under the legal age. ID may be requested."] },
      { h: "Cancellation by the organiser", p: ["If an event is cancelled, ticket holders are refunded the price paid."] },
      { h: "Contact", p: [`${site.email} — ${site.phone}`] },
    ],
  },
};
