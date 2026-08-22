<script lang="ts">
	import { type Options, parseOptions, tip, urlParam } from 'fuma'

	interface Props {
		class?: string
		key: string
		options: Options
		removeKeys?: string[]
		/**
		 * Option tenue pour active quand le paramètre est absent. Le contrôle n'a alors plus
		 * d'état vide: une option est toujours retenue, et celle du défaut se contente de
		 * retirer la clé.
		 */
		defaultValue?: string
	}

	let { class: klass = '', key, options, removeKeys = [], defaultValue }: Props = $props()

	let _options = $derived(parseOptions(options))

	const isActive = (value: string) =>
		defaultValue === undefined
			? urlParam.has(key, value)
			: (urlParam.get(key) ?? defaultValue) === value

	const hrefOf = (value: string) => {
		if (defaultValue === undefined) return urlParam.toggle({ [key]: value }, ...removeKeys)
		if (value === defaultValue) return urlParam.without(key, ...removeKeys)
		return urlParam.with({ [key]: value }, ...removeKeys)
	}
</script>

<div class="join {klass}">
	{#each _options as opt (opt.value)}
		{@const active = isActive(opt.value)}
		{@const OptIcon = opt.icon}
		<a
			href={hrefOf(opt.value)}
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
