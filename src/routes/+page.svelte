<script lang="ts">
	import { mdiPlus } from '@mdi/js'
	import {Icon, Dialog} from '$lib/material'
	import EventForm from '$lib/EventForm.svelte'
	import Header from '$lib/Header.svelte'
	import Footer from '$lib/Footer.svelte'
	

	export let data

	let createDialog: HTMLDialogElement
</script>

<Dialog bind:dialog={createDialog} title="Nouvel évènement">
	<EventForm
		on:cancel={() => createDialog.close()}
		on:success={() => createDialog.close()}
	/>
</Dialog>

<Header userName={data.user?.firstName} />

<main class="grow p-2">
	<div class="max-w-md mx-auto">
		<div class="flex gap-2 items-center my-6">
			<h2 class="text-xl">Tous les évènements</h2>
			<div class="grow" />
			{#if data.user?.isEmailVerified}
				<button class="btn btn-sm" on:click={() => createDialog.showModal()}>
					<Icon path={mdiPlus} class="fill-base-content" />
					Nouveau
				</button>
			{/if}
		</div>

		<ul class="flex flex-col gap-2 mt-2">
			{#each data.events as event}
				<a
					href="/{event.id}"
					class="
						shadow hover:shadow-md transition-shadow
						bg-base-100 border rounded-lg p-6
					"
				>
					<li>
						<p class="font-medium mb-2">{event.name}</p>
						<p class="opacity-70">{event.description}</p>
					</li>
				</a>
			{/each}
		</ul>
	</div>
</main>

<Footer />
