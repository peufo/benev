<script lang="ts">
	import Notifications from 'svelte-notifications'
	import { mdiAccountOutline } from '@mdi/js'
	import { page } from '$app/stores'
	import Icon from '$lib/material/Icon.svelte'
	import '../app.css'

	export let data

	const routes: [string, string][] = [
		['/', 'Home'],
		['/simulation', 'Simulation'],
		['/auth', 'Auth'],
	]
</script>

<Notifications zIndex={50}>
	<div class="flex min-h-screen flex-col bg-base-200">
		<div class="p-2">
			<header class="navbar rounded-2xl bg-base-100 shadow-xl">
				<div class="navbar-start">
					<a class="btn-ghost btn text-xl" href="/">BENEV</a>
				</div>
				<div class="navbar-end gap-2">
					<div class="tabs tabs-boxed">
						{#each routes as [href, label]}
							<a class="tab" {href} class:tab-active={$page.route.id === href}>
								{label}
							</a>
						{/each}
					</div>

					<a class="btn-ghost rounded-btn btn" href="/auth">
						<Icon path={mdiAccountOutline} />
						{data.user?.name || ''}
					</a>
				
				</div>
			</header>
		</div>

		<main class="grow p-2">
			<slot />
		</main>
	</div>
</Notifications>
