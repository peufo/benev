<script lang="ts">
	import { CardLink } from '$lib/material'
	import logo from '$lib/assets/logo.svg'
	import Header from '$lib/Header.svelte'
	import Footer from '$lib/Footer.svelte'
	import Benev from '$lib/Benev.svelte'

	export let data
</script>

<Header user={data.user}>
	<a
		slot="start"
		href="/"
		class="
			text-lg hover:bg-base-200 h-12 px-2 flex items-center gap-2 rounded-lg
			whitespace-nowrap overflow-hidden overflow-ellipsis min-w-0
		"
	>
		<img src={logo} alt="logo benev" class="w-9 h-9" height="512" width="512" />

		<Benev class="mx-2 text-2xl" />
	</a>
</Header>

<main class="grow p-2">
	<div class="max-w-lg mx-auto">
		<div class="card bg-base-100 shadow">
			<div class="card-body">
				<div class="text-center">
					<img src={logo} alt="Logo benev" class="w-36 mx-auto" />

					<h1 class="mt-2 text-4xl">
						<Benev />
					</h1>

					<h2 class="text-base-content/80 text-sm mt-10">Ta plateforme de gestion de bénévoles</h2>

					<div class="mt-2">
						<span class="badge text-base-content/80 shadow-md">simple</span>
						<span class="badge text-base-content/80 shadow-md">open source</span>
						<span class="badge text-base-content/80 shadow-md">abordable</span>
					</div>
				</div>

				<div class="grid place-content-center mt-12 mb-10">
					<a href="/me" class="btn btn-secondary">
						{data.user ? 'Voir mes évènements' : 'Essayer maintenant'}
					</a>
				</div>
			</div>
		</div>

		<!-- ACTIVES EVENTS -->
		{#if data.events.length}
			<div class="flex gap-2 items-center mt-10 mb-4">
				<h2 class="text-xl font-semibold text-base-content/70">Évènements à venir</h2>
			</div>

			<ul class="flex flex-col gap-2 mt-2">
				{#each data.events as event}
					<CardLink href="/{event.id}">
						<div slot="title" class="flex items-center gap-2">
							{#if event.logo}
								<img src={event.logo} alt="logo" class="h-6" />
							{/if}
							{event.name}
						</div>
						<p class="opacity-70">{event.description}</p>
					</CardLink>
				{/each}
			</ul>
		{/if}
	</div>
</main>

<Footer />
