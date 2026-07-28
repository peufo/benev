<script lang="ts">
	import { Icon } from '$lib/fuma/ui/icon/index.js'
	import { parseOptions, type Options } from '$lib/fuma/utils/options.js'
	import { urlParam } from '$lib/fuma/store/param.js'

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
		{@const active = $urlParam.hasValue(key, opt.value)}
		<a
			href={$urlParam.toggle({ [key]: opt.value }, ...removeKeys)}
			class="btn join-item btn-sm"
			class:btn-primary={active}
			class:w-9={opt.icon}
		>
			{#if opt.icon}
				<Icon
					path={opt.icon}
					title={opt.label}
					class={active ? 'fill-primary-content' : 'opacity-70'}
					size={20}
				/>
			{:else}
				{opt.label}
			{/if}
		</a>
	{/each}
</div>
