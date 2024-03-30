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
		content: `
      <p>
        Salut <span class="suggestion" data-key="member.user.firstName">Prénom</span>, <br />
        <span class="suggestion" data-key="authorName">Auteur de l'invitation</span>
        t'invite à rejoindre l'équipe de bénévoles 
        <span class="suggestion" data-key="member.event.name">Nom de l'évènement</span>.
      </p>
      <p>
        Tu peux accepter ton invitation et trouver plus d'informations en cliquant sur
        <span class="suggestion" data-key="acceptURL">ce lien</span>.
      </p>
    `,
	},
	{
		path: 'invitation_accept',
		description: 'Notification envoyé au membre quand un responsable accepte sa participation.',
		title: 'Bienvenue dans notre équipe bénévole',
		content: `
      <p>
        Salut <span class="suggestion" data-key="member.user.firstName">prénom</span>,<br />
        Tu fais désormais partie des nôtres. Tu peux maintenant compléter ton profil via ton
        <span class="suggestion" data-key="me">tableau de bord</span>.
        si ce n'est déjà fait et t'inscrire aux tranches horaires qui t'intéressent en consultant les différents
        <span class="suggestion" data-key="teams">secteurs</span>.
      </p>
      <p>
        Les responsables qui ont accès à ton profil pourront ensuite valider tes tranches horaires et
        prendre contact avec toi le moment venu.
      </p>
      <p>Un énorme merci pour ta disponibilité !</p>
      <p>
        Toute l'équipe 
        <span class="suggestion" data-key="member.event.name">Nom de l'évènement</span>
      </p>
    `,
	},
	{
		path: 'subscribe_request',
		description:
			"Notification envoyée au membre quand un responsable l'inscrit à une période de travail.",
		title: 'Nouvelle inscription',
		content: `
      <p>
        Salut ! <br />
        <b><span class="suggestion" data-key="authorName"></b> t'invite à rejoindre l'équipe de bénévoles durant la
        période de travail suivante :
      </p>
      <b><span class="suggestion" data-key="subscribe.period.team.name">Secteur de travail</span></b><br />
      <b><span class="suggestion" data-key="subscribe.period">Période de travail</span></b>
      <p>
        Tu peux retrouver et confirmer tes inscriptions dans ton 
        <span class="suggestion" data-key="me">tableau de bord</span>.
      </p>
    `,
	},
	{
		path: 'subscribe_accepted',
		description: 'Notification envoyer au membre quand un responsable accepte une inscription',
		title: 'Ton inscription a été acceptée',
		content: `
      <p>
        Bonne nouvelle ! <br />
        Tu pourras rejoindre la période de travail suivante :
      </p>
      <b><span class="suggestion" data-key="subscribe.period.team.name">Secteur de travail</span></b><br />
      <b><span class="suggestion" data-key="subscribe.period">Période de travail</span></b>
      <p>
        Tu peux retrouver tes inscriptions dans ton 
        <span class="suggestion" data-key="me">tableau de bord</span>.
      </p>
    `,
	},
	{
		path: 'subscribe_denied',
		description: 'Notification envoyer au membre quand un responsable refuse une inscription',
		title: 'Ton inscription à été déclinée',
		content: `
      <p>Ton inscription à la période de travail suivante a été déclinée :</p>
      <b><span class="suggestion" data-key="subscribe.period.team.name">Secteur de travail</span></b><br />
      <b><span class="suggestion" data-key="subscribe.period">Période de travail</span></b>
      <p>
        Tu peux retrouver tes inscriptions dans ton 
        <span class="suggestion" data-key="me">tableau de bord</span>.
      </p>
    `,
	},
	{
		path: 'subscribe_cancelled',
		description: 'Notification envoyer au membre quand un responsable annule une inscription',
		title: 'Ton inscription a été annulée',
		content: `
      <p>Ton inscription à la période de travail suivante a été annulée :</p>
      <b><span class="suggestion" data-key="subscribe.period.team.name">Secteur de travail</span></b><br />
      <b><span class="suggestion" data-key="subscribe.period">Période de travail</span></b>
      <p>
        Tu peux retrouver tes inscriptions dans ton 
        <span class="suggestion" data-key="me">tableau de bord</span>.
      </p>
    `,
	},
].map((model) => ({ ...model, type: 'email' } as EmailModel))
