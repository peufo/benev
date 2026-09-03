<script lang="ts">
	import { Page } from '$lib/pages'
	import { eventPath } from '$lib/eventPath'

	let { data } = $props()
</script>

{#if data.memberCanRegister}
	<div class="text-center my-8">
		<a href={eventPath('/register')} class="btn btn-primary"> Je veux devenir bénévole </a>
	</div>
{/if}

<Page page={data.page}>
	{#snippet placeholder()}
		<h2>Salut 👋</h2>
		<p>
			Bienvenue dans l'espace bénévole de l'évènement <b>{data.event.name}</b><br />
		</p>
		{#if data.event.selfSubscribeAllowed}
			<p>
				Tu peux
				<a href={eventPath('/teams')}> parcourir les secteurs </a>
				pour t'inscrire aux périodes de travail qui t'intéressent.
			</p>
		{/if}
		<p>
			<a href={eventPath('/me')}>Ton tableau de bord</a> te permetra ensuite de consulter ton profil et
			tes inscriptions.
		</p>
	{/snippet}
</Page>

{#if data.memberCanRegister}
	<div class="text-center my-8">
		<a href={eventPath('/register')} class="btn btn-primary"> Je veux devenir bénévole </a>
	</div>
{/if}
