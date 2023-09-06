<script lang="ts">
	import { page } from '$app/stores'
	const links = ['new_subscribe', 'verification_link', 'reset_password', 'invite']
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
