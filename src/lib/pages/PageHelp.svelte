<script lang="ts">
	import WhoCanDoWhat from './WhoCanDoWhat.svelte'
	import { page } from '$app/state'
	import { eventPath } from '$lib/eventPath'

	// `eventPath` rend un chemin relatif à la page courante: l'adresse qu'on affiche pour la
	// partager doit être résolue contre elle pour redevenir une URL entière.
	let shareUrl = $derived(new URL(eventPath(''), page.url).href)
</script>

<section>
	<h3>Ton espace en ligne</h3>

	<p>
		Tu devrais
		<a href={eventPath('/admin/pages')}>éditer la page d'accueil</a>
		pour passer les infos les plus importantes à tes futurs bénévoles. Tu peux également librement créer
		d'autres pages complémentaires (FAQ, conditions, etc...).
	</p>
</section>

<section>
	<h3>Les secteurs</h3>
	<p>
		<a href={eventPath('/admin/teams')}>Crée des secteurs</a>
		et nomme leurs responsables.<br />

		Tu pourras ensuite gérer les périodes de travail depuis la page dédiée à chaque secteur ou
		depuis
		<a href={eventPath('/admin/plan')}>la planification.</a>
	</p>
</section>

<section>
	<h3>Adhésion des membres</h3>
	<p>
		Le profil de base des membres contient déjà des informations essentielles telles que leur
		addresse, leur numéro de téléphone, leur email et leur âge.<br />
		Tu peux
		<a href={eventPath('/admin/settings#membership')}>paramétrer le processus d'adhésion</a> et définir
		les informations que tu souhaites récolter auprès des membres.
	</p>
</section>

<section>
	<h3>Inviter des administrateur·ices</h3>
	<p>
		Les administrateur·ices te soutiennent dans la gestion de ton évènement. Pour en nommer, tu peux
		rechercher ou inviter quelqu'un à partir de
		<a href={eventPath('/admin/members')}>la liste des membres</a>, puis lui attribuer le rôle
		d'administrateur·ice depuis son profil.
	</p>
</section>

<section>
	<h3>Partage</h3>
	<p>
		Ton évènement est par défaut en mode "brouillon". Une fois que tu es prêt·e à le rendre public,
		change son statut sur <a href={eventPath('/admin/settings#status')}
			>l'onglet de configuration.</a
		>
	</p>
	<p>
		Il ne te reste maintenant plus qu'à partager ton évènement
		<b class="whitespace-nowrap">
			👉
			<a href={eventPath('')}>{shareUrl}</a>
		</b>
	</p>
</section>
<hr />
<WhoCanDoWhat />
