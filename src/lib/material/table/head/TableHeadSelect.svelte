<script lang="ts">
	import { page } from '$app/stores'
	import { jsonParse } from '$lib/jsonParse'
	import { type Options, type TableField, parseOptions, DropDown, Icon } from '$lib/material'
	import { urlParam } from '$lib/store'
	import { derived } from 'svelte/store'

	export let field: TableField
	export let options: Options
	export let multiSelect = false

	let _options = initOptions($page.url)
	page.subscribe(({ url }) => (_options = initOptions(url)))

	function initOptions({ searchParams }: URL) {
		const selection = searchParams.get(field.key)
		const selections = jsonParse<string[]>(searchParams.get(field.key), [])

		function getActive(value: string) {
			if (!multiSelect) return selection === value
			return selections.includes(value)
		}

		return parseOptions(options).map((option) => ({
			...option,
			isActive: getActive(option.value),
		}))
	}

	const getHref = derived(urlParam, (params) => (value: string) => {
		const selections = jsonParse<string[]>(params.get(field.key), [])
		if (!multiSelect) return params.toggle({ [field.key]: value }, 'skip', 'take')
		if (selections.includes(value)) {
			const newSelections = selections.filter((v) => v !== value)
			if (!newSelections.length) return params.without(field.key)
			return params.with({ [field.key]: JSON.stringify(newSelections) }, 'skip', 'take')
		}
		return params.with({ [field.key]: JSON.stringify([...selections, value]) }, 'skip', 'take')
	})
</script>

<th class="p-1">
	<DropDown hideOnBlur hideOnNav={!multiSelect} tippyProps={{ appendTo: () => document.body }}>
		<button slot="activator" class="menu-item w-full flex-wrap gap-y-1 min-h-8">
			<span>{field.label}</span>

			{#if _options.filter((option) => option.isActive).length}
				<div class="flex flex-wrap gap-1">
					{#each _options.filter((option) => option.isActive) as option}
						<span class="badge badge-primary badge-xs text-[0.7rem] font-normal text-white">
							{#if option.icon}
								<Icon path={option.icon} size={10} class="-translate-x-1 fill-white/80" />
							{/if}
							{option.label}
						</span>
					{/each}
				</div>
			{/if}
		</button>

		<div class="flex flex-col gap-1">
			{#each _options as { isActive, icon, label, value }}
				<a
					href={$getHref(value)}
					class="menu-item px-3 py-2"
					class:active={isActive}
					data-sveltekit-noscroll
					data-sveltekit-replacestate
				>
					{#if icon}
						<Icon path={icon} size={18} class="opacity-60" />
					{/if}
					<span class="whitespace-nowrap font-normal">{label}</span>
				</a>
			{/each}
		</div>
	</DropDown>
</th>
