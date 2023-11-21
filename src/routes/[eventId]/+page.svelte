<script lang="ts">
	import { Icon } from '$lib/material'
	import { mdiMenu } from '@mdi/js'
	import { Page, PageHelp } from '$lib/pages'
	export let data
</script>

<Page page={data.page}>
	<svelte:fragment slot="placeholder">
		{#if data.member?.roles.includes('admin')}
			<h2>Salut 👋</h2>
			<p>
				Bienvenue dans l'espace réservé à ton évènement.<br />
				Voici une petite aide pour bien démarrer.<br />
				Tu peux la retrouver à tout moment en passant par le menu
				<span class="ml-1 p-0 btn btn-xs w-6 rounded cursor-default hover:bg-base-200">
					<Icon path={mdiMenu} size={14} />
				</span>
			</p>
			<PageHelp />
		{:else}
			<h2>Salut 👋</h2>
			<p>
				Bienvenue dans l'espace bénévole de l'évènement <b>{data.event.name}</b><br />
			</p>
			<p>
				Tu peux
				<a href="/{data.event.id}/teams"> parcourir les secteurs </a>
				pour t'inscrire aux périodes de travail qui t'intéressent.
			</p>
			<p>
				<a href="/{data.event.id}/me">Ton tableau de bord</a> te permetra ensuite de consulter ton profil
				et tes inscriptions.
			</p>
		{/if}
	</svelte:fragment>
</Page>
