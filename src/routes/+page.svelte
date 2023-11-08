<script lang="ts">
	import { CardLink } from '$lib/material'
	import logo from '$lib/assets/logo.svg'
	import Header from '$lib/Header.svelte'
	import Footer from '$lib/Footer.svelte'

	export let data
</script>

<Header user={data.user}>
	<a slot="start" class="btn-ghost text-lg btn btn-square" href="/">
		<img src={logo} alt="logo benev" class="w-9 h-9" height="512" width="512" />
	</a>
</Header>

<main class="grow p-2">
	<div class="max-w-lg mx-auto">
		<div class="card bg-base-100 shadow">
			<div class="card-body">
				<div class="flex flex-col gap-10 items-center justify-center text-center">
					<img src={logo} alt="Logo benev" class="w-36" />
					<div>
						<h1 class="font-medium text-2xl opacity-80">benev</h1>
						<h2 class="opacity-90 text-sm mt-2">Ta plateforme de gestion de bénévoles</h2>
					</div>
				</div>
				
				<div class="grid place-content-center mt-14 mb-10">
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
