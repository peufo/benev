<script lang="ts">
	import WhoCanDoWhat from './WhoCanDoWhat.svelte'
	import { eventPath } from '$lib/store'
</script>

<section>
	<h3>Édition des pages</h3>

	<p>
		Tu devrais
		<a href="{$eventPath}/admin/pages">éditer la page d'accueil</a>
		pour passer les infos les plus importantes à tes futurs bénévoles. Tu peux également librement créer
		d'autres pages complémentaires (FAQ, conditions, etc...).
	</p>
</section>

<section>
	<h3>Secteurs</h3>
	<p>
		<a href="{$eventPath}/teams">Créer des secteurs</a>
		et de nouvelles périodes de travail. Tu pourras ensuite nommer tes membres comme responsable de secteur.
	</p>
</section>

<section>
	<h3>Partage</h3>
	<p>
		Envoie tes bénévoles sur ta page d'accueil 👉 <b>
			<a href="https://benev.ch{$eventPath}">https://benev.ch{$eventPath}</a>
		</b>
	</p>
	<p>
		Tu peux aussi directement les inviter à devenir membre 👉 <b>
			<a href="https://benev.ch{$eventPath}/invite">https://benev.ch{$eventPath}/invite</a>
		</b>
	</p>
</section>

<WhoCanDoWhat />
