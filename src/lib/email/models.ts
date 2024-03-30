import type { Prisma } from '@prisma/client'

export type EmailEvent =
	| 'invitation_create'
	| 'invitation_accept'
	| 'subscribe_request'
	| 'subscribe_accepted'
	| 'subscribe_denied'
	| 'subscribe_cancelled'
type EmailModel = Omit<Prisma.PageCreateInput, 'event'> & { path: EmailEvent }

export const defaultEmailModels: EmailModel[] = [
	{
		path: 'invitation_create',
		title: 'Invitation à rejoindre notre équipe de bénévoles',
		description: 'Email envoyé aux membres invités par un responsable.',
		content: `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"text","text":"Salut "},{"type":"mention","attrs":{"id":"member.user.firstName","label":"Prénom"}},{"type":"text","text":","}]},{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"mention","attrs":{"id":"authorName","label":"Auteur de l'invitation"}},{"type":"text","text":" t'invite à rejoindre l'équipe de bénévoles "},{"type":"mention","attrs":{"id":"member.event.name","label":"Nom de l'évènement"}},{"type":"text","text":"."}]},{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"text","text":"Tu peux accepter ton invitation et trouver toutes les informations concernant ta participation en cliquant sur "},{"type":"mention","attrs":{"id":"acceptURL","label":"Lien pour accepter l'invitation"}},{"type":"text","text":"."}]}]}`,
	},
	{
		path: 'invitation_accept',
		description: 'Email envoyé aux membres dont la participation à été validé par un responsable.',
		title: 'Bienvenue dans notre équipe bénévole',
		content: `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"text","text":"Salut "},{"type":"mention","attrs":{"id":"member.user.firstName","label":"Prénom"}},{"type":"text","text":","}]},{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"text","text":"Tu fais désormais partie des nôtres. Tu peux maintenant compléter ton profil via ton "},{"type":"mention","attrs":{"id":"me","label":"Lien vers le tableau de bord"}},{"type":"text","text":"si ce n'est déjà fait et t'inscrire aux tranches horaires qui t'intéressent en consultant les différents "},{"type":"mention","attrs":{"id":"teams","label":"Lien vers les secteurs"}},{"type":"text","text":"."}]},{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"text","text":"Les responsables qui ont accès à ton profil pourront ensuite valider tes inscriptions et prendre contact avec toi le moment venu."}]},{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"text","text":"Un énorme merci pour ta disponibilité !"}]},{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"text","text":"Toute l'équipe "},{"type":"mention","attrs":{"id":"member.event.name","label":"Nom de l'évènement"}}]}]}`,
	},
	{
		path: 'subscribe_request',
		description:
			"Notification envoyée au membre quand un responsable l'inscrit à une période de travail.",
		title: 'Nouvelle inscription',
		content: `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"text","text":"Salut "},{"type":"mention","attrs":{"id":"member.user.firstName","label":"Prénom"}},{"type":"text","text":","}]},{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"mention","attrs":{"id":"authorName","label":"Auteur de l'invitation"}},{"type":"text","text":" t'invite à rejoindre l'équipe de bénévoles durant la période de travail suivante :"}]},{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"mention","attrs":{"id":"subscribe.period.team.name","label":"Secteur de travail"},"marks":[{"type":"bold"}]},{"type":"text","marks":[{"type":"bold"}],"text":" "},{"type":"hardBreak","marks":[{"type":"bold"}]},{"type":"mention","attrs":{"id":"subscribe.period","label":"Période de travail"},"marks":[{"type":"bold"}]},{"type":"text","marks":[{"type":"bold"}],"text":" "}]},{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"text","text":"Tu peux retrouver et confirmer tes inscriptions dans ton "},{"type":"mention","attrs":{"id":"me","label":"Lien vers le tableau de bord"}},{"type":"text","text":"."}]}]}`,
	},
	{
		path: 'subscribe_accepted',
		description: 'Notification envoyée au membre quand un responsable accepte une inscription',
		title: 'Inscription acceptée',
		content: `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"text","text":"Bonne nouvelle "},{"type":"mention","attrs":{"id":"member.user.firstName","label":"Prénom"}},{"type":"text","text":"! "}]},{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"text","text":"Ta participation à la période de travail suivante a été validée :"}]},{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"mention","attrs":{"id":"subscribe.period.team.name","label":"Secteur de travail"},"marks":[{"type":"bold"}]},{"type":"text","marks":[{"type":"bold"}],"text":" "},{"type":"hardBreak","marks":[{"type":"bold"}]},{"type":"mention","attrs":{"id":"subscribe.period","label":"Période de travail"},"marks":[{"type":"bold"}]},{"type":"text","marks":[{"type":"bold"}],"text":" "}]},{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"text","text":"Tu peux retrouver tes inscriptions dans ton "},{"type":"mention","attrs":{"id":"me","label":"Lien vers le tableau de bord"}},{"type":"text","text":"."}]}]}`,
	},
	{
		path: 'subscribe_denied',
		description: 'Notification envoyée au membre quand un responsable refuse une inscription',
		title: 'Inscription déclinée',
		content: `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"text","text":"Salut "},{"type":"mention","attrs":{"id":"member.user.firstName","label":"Prénom"}},{"type":"text","text":","}]},{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"text","text":"Ton inscription à la période de travail suivante a été déclinée :"}]},{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"mention","attrs":{"id":"subscribe.period.team.name","label":"Secteur de travail"},"marks":[{"type":"bold"}]},{"type":"text","marks":[{"type":"bold"}],"text":" "},{"type":"hardBreak","marks":[{"type":"bold"}]},{"type":"mention","attrs":{"id":"subscribe.period","label":"Période de travail"},"marks":[{"type":"bold"}]}]},{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"text","text":"Tu peux retrouver tes inscriptions dans ton "},{"type":"mention","attrs":{"id":"me","label":"Lien vers le tableau de bord"}},{"type":"text","text":"."}]}]}`,
	},
	{
		path: 'subscribe_cancelled',
		description: 'Notification envoyée au membre quand un responsable annule une inscription',
		title: 'Inscription annulée',
		content: `{"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"text","text":"Salut "},{"type":"mention","attrs":{"id":"member.user.firstName","label":"Prénom"}},{"type":"text","text":","}]},{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"text","text":"Ton inscription à la période de travail suivante a été annulée :"}]},{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"mention","attrs":{"id":"subscribe.period.team.name","label":"Secteur de travail"},"marks":[{"type":"bold"}]},{"type":"text","marks":[{"type":"bold"}],"text":" "},{"type":"hardBreak","marks":[{"type":"bold"}]},{"type":"mention","attrs":{"id":"subscribe.period","label":"Période de travail"},"marks":[{"type":"bold"}]},{"type":"text","marks":[{"type":"bold"}],"text":" "}]},{"type":"paragraph","attrs":{"textAlign":"left","indent":0},"content":[{"type":"text","text":"Tu peux retrouver tes inscriptions dans ton "},{"type":"mention","attrs":{"id":"me","label":"Lien vers le tableau de bord"}},{"type":"text","text":"."}]}]}`,
	},
].map((model) => ({ ...model, type: 'email' } as EmailModel))
