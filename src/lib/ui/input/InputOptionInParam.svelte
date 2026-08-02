<script lang="ts">
	import { parseOptions, type Options } from '$lib/fuma-legacy/utils/options'
	import { tip, urlParam } from 'fuma'

	interface Props {
		class?: string
		key: string
		options: Options
		removeKeys?: string[]
	}

	let { class: klass = '', key, options, removeKeys = [] }: Props = $props()

	let _options = $derived(parseOptions(options))
</script>

<div class="join {klass}">
	{#each _options as opt}
		{@const active = urlParam.has(key, opt.value)}
		{@const OptIcon = opt.icon}
		<a
			href={urlParam.toggle({ [key]: opt.value }, ...removeKeys)}
			class="btn join-item btn-sm"
			class:btn-primary={active}
			class:w-9={opt.icon}
		>
			{#if OptIcon}
				<span class="inline-flex" use:tip={{ content: opt.label }}>
					<OptIcon class={active ? 'text-primary-content' : 'opacity-70'} size={20} />
				</span>
			{:else}
				{opt.label}
			{/if}
		</a>
	{/each}
</div>
