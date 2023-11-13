<script lang="ts">
	import WhoCanDoWhat from './WhoCanDoWhat.svelte'
	import { eventPath } from '$lib/store'
</script>

<section>
	<h3>Ton espace en ligne</h3>

	<p>
		Tu devrais
		<a href="{$eventPath}/admin/pages">éditer la page d'accueil</a>
		pour passer les infos les plus importantes à tes futurs bénévoles. Tu peux également librement créer
		d'autres pages complémentaires (FAQ, conditions, etc...).
	</p>
</section>

<section>
	<h3>Les secteurs</h3>
	<p>
		<a href="{$eventPath}/teams">Crée des secteurs</a>
		et nomme leurs responsables.<br />

		Tu pourras ensuite gérer les périodes de travail depuis la page dédiée à chaque secteur ou
		depuis
		<a href="{$eventPath}/admin/plan">la planification.</a>
	</p>
</section>

<section>
	<h3>Profil des membres</h3>
	<p>
		Le profil de base des membres contient déjà des informations essentielles telles que leur
		addresse, leur numéro de téléphone, leur email et leur âge.<br />
		Ajoute de nouveaux champs si tu souhaites obtenir ou renseigner d'autres données relatives aux membres.
	</p>
</section>

<section>
	<h3>Inviter des administrateurs</h3>
	<p>
		Les administrateurs te soutiennent dans la gestion de ton évènement. Pour en nommer de nouveaux,
		tu peux rechercher ou inviter un utilisateur à partir de
		<a href="{$eventPath}/admin/members">la liste des membres</a>, puis lui attribuer le rôle
		d'administrateur depuis son profil.
	</p>
</section>

<section>
	<h3>Partage</h3>
	<p>
		Ton évènement est par défaut en mode "brouillon". Une fois que tu es prêt à le rendre public,
		change son statut sur <a href="{$eventPath}/admin/config">l'onglet de configuration.</a>
	</p>
	<p>
		Il ne te reste maintenant plus qu'à partager ton évènement
		<b class="whitespace-nowrap">
			👉
			<a href="https://benev.io{$eventPath}">https://benev.io{$eventPath}</a>
		</b>
	</p>
</section>
<hr />
<WhoCanDoWhat />
