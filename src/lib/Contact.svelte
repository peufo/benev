<script lang="ts">
	import { mdiEmailOutline, mdiPhone } from '@mdi/js'
	import { Icon } from '$lib/material'

	export let user: { email: string; phone: string | null; firstName: string; lastName: string }
</script>

<div class="flex gap-1 justify-end">
	{#if user.phone}
		<a
			href="tel:{user.phone}"
			target="_blank"
			class="btn btn-square btn-sm btn-ghost relative"
			on:click|stopPropagation
		>
			<Icon
				path={mdiPhone}
				size={18}
				title="Téléphoner à {user.firstName}"
				tippyProps={{ appendTo: 'parent' }}
			/>
		</a>
	{/if}
	<a
		href="mailto:{user.email}"
		target="_blank"
		class="btn btn-square btn-sm btn-ghost relative"
		on:click|stopPropagation
	>
		<Icon
			path={mdiEmailOutline}
			size={18}
			title="Envoyer un mail à {user.firstName}"
			tippyProps={{ appendTo: 'parent' }}
		/>
	</a>
</div>
