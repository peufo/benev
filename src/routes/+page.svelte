<script lang="ts">
	import { mdiPlus } from '@mdi/js'
	import Icon from '$lib/material/Icon.svelte'
	import EventForm from './EventForm.svelte'
	import Header from '$lib/Header.svelte'
	import Footer from '$lib/Footer.svelte'
	import {rowLink} from '$lib/action'

	export let data

	let createDialog: HTMLDialogElement
</script>

<dialog bind:this={createDialog} class="modal">
	<EventForm
		class="modal-box"
		on:cancel={() => createDialog.close()}
		on:success={() => createDialog.close()}
	/>
</dialog>

<Header userName={data.user?.firstName} />

<main class="grow p-2">
	<div class="p-4 card bg-base-100 max-w-4xl m-auto">
		<div class="flex gap-2 py-2 items-center">
			<h2 class="text-2xl">Tous les évènements</h2>
			<div class="grow" />
			{#if data.user?.isEmailVerified}
				<button class="btn btn-neutral" on:click={() => createDialog.showModal()}>
					<Icon path={mdiPlus} class="fill-neutral-content" />
					Nouveau
				</button>
			{/if}
		</div>
		<div class="divider" />

		<table class="table text-base">
			<thead>
				<tr>
					<th>Nom</th>
					<th>Description</th>
				</tr>
			</thead>

			<tbody>
				{#each data.events as event}
					<tr use:rowLink={{href: `/${event.id}`}}>
						<td>
							{event.name}
						</td>
						<td>{event.description || '-'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>

<Footer />
