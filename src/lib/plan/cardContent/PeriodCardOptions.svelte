<script lang="ts">
	import { tip, urlParam } from 'fuma'
	import { CARD_CONTENT_OPTIONS } from './options'
</script>

<div class="flex items-center gap-[3px] rounded-lg bg-base-200 p-1">
	{#each Object.entries(CARD_CONTENT_OPTIONS) as [key, { title, icon: OptionIcon, isReversed }] (key)}
		{@const isKeyInParam = urlParam.has(key)}
		{@const isActive = isReversed ? !isKeyInParam : isKeyInParam}
		<a
			class="flex h-6 items-center justify-center gap-2 rounded p-1 w-6"
			class:bg-base-100={isActive}
			class:shadow={isActive}
			href={urlParam.toggle({ [key]: '1' })}
			data-sveltekit-replacestate
			data-sveltekit-noscroll
			use:tip={{ content: title }}
		>
			<OptionIcon size={17} class="opacity-70" />
		</a>
	{/each}
</div>
