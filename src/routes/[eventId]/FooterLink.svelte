<script lang="ts">
	import { Icon } from 'fuma'
	export let link: string | null
	export let icon = ''
	export let protocol = ''

	console.log(link.replace(/^http(s)?:\/\/(www\.)?/, ''))
</script>

{#if link}
	{@const label = link.replace(/^http(s)?:\/\/(www\.)?/, '').replace(/\/$/, '')}
	<a class="btn btn-sm sm:btn-md btn-ghost flex" href="{protocol}{link}" target="_blank">
		<slot name="icon">
			{#if icon}
				<Icon path={icon} />
			{/if}
		</slot>
		<slot {label}>{label}</slot>
	</a>
{/if}
