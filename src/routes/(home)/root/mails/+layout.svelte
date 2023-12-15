<script lang="ts">
	import { page } from '$app/stores'

	const links = Object.keys(import.meta.glob('./*/+page.svelte')).map((p) =>
		p.replace('./', '').replace('/+page.svelte', '')
	)
</script>

<div class="flex gap-4">
	<ul class="menu bg-base-300 rounded-box">
		{#each links as link}
			{@const href = `/root/mails/${link}`}
			<li>
				<a {href} class:active={$page.route.id === href}>
					{link}
				</a>
			</li>
		{/each}
	</ul>

	<div class="prose max-w-none grow bg-white">
		<slot />
	</div>
</div>
