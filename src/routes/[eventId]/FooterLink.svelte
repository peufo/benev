<!-- @migration-task Error while migrating Svelte code: This migration would change the name of a slot (icon to icon_1) making the component unusable -->
<script lang="ts">
	import { Icon } from '$lib/fuma'
	export let link: string | null
	export let icon = ''
	export let protocol = ''
</script>

{#if link}
	{@const label = link.replace(/^http(s)?:\/\/(www\.)?/, '').replace(/\/$/, '')}
	<a
		class="btn btn-sm sm:btn-md btn-ghost flex flex-nowrap items-center max-w-96"
		href="{protocol}{link}"
		target="_blank"
	>
		<slot name="icon">
			{#if icon}
				<Icon path={icon} />
			{/if}
		</slot>
		<slot {label}><span>{label}</span></slot>
	</a>
{/if}
