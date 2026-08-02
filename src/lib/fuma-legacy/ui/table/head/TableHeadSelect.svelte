<script lang="ts" generics="Item extends {id: string}">
	import { ListFilterIcon } from '@lucide/svelte'
	import { page } from '$app/stores'

	import { jsonParse } from 'fuma'
	import type { TableField } from '$lib/fuma-legacy/ui/table/index.js'
	import { DropDown } from 'fuma'
	import { type Options, parseOptions } from 'fuma'
	import { urlParam } from 'fuma'

	interface Props {
		field: TableField<Item>
		options: Options
		multiSelect?: boolean
		placeholder?: string
	}

	let { field, options, multiSelect = false, placeholder = 'No option' }: Props = $props()

	let _options = $state(initOptions($page.url))
	page.subscribe(({ url }) => (_options = initOptions(url)))

	// `derived` de svelte/store est importé sous un autre nom: la rune `$derived`
	// ne peut pas coexister avec une variable du même nom.
	let optionsActive = $derived(_options.filter((option) => option.isActive))

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

	// `urlParam` de fuma 2 est un objet runes: plus de `derived` de store.
	function getHref(value: string) {
		const params = urlParam
		const selections = jsonParse<string[]>(params.get(field.key), [])
		if (!multiSelect) return params.toggle({ [field.key]: value }, 'skip', 'take')
		if (selections.includes(value)) {
			const newSelections = selections.filter((v) => v !== value)
			if (!newSelections.length) return params.without(field.key)
			return params.with({ [field.key]: JSON.stringify(newSelections) }, 'skip', 'take')
		}
		return params.with({ [field.key]: JSON.stringify([...selections, value]) }, 'skip', 'take')
	}
</script>

<th class="p-1">
	<DropDown hideOnBlur hideOnNav={!multiSelect} tippyProps={{ appendTo: () => document.body }}>
		{#snippet activator()}
			<button class="menu-item min-h-8 w-full flex-wrap gap-y-1">
				<div class="flex gap-2">
					{field.label}
					{#if !optionsActive.length}
						<ListFilterIcon size={15} class="opacity-50" />
					{/if}
				</div>

				{#if optionsActive.length}
					<div class="flex flex-wrap gap-1">
						{#each optionsActive as option (option.value)}
							{@const OptionIcon = option.icon}
							<span class="badge badge-primary badge-xs text-[0.7rem] font-normal text-white">
								{#if OptionIcon}
									<OptionIcon size={10} class="-translate-x-1 text-white/80" />
								{/if}
								{option.label}
							</span>
						{/each}
					</div>
				{/if}
			</button>
		{/snippet}

		<div class="flex flex-col gap-1">
			{#each _options as { isActive, icon: OptionIcon, label, value } (value)}
				<a
					href={getHref(value)}
					class="menu-item px-3 py-2"
					class:active={isActive}
					data-sveltekit-noscroll
					data-sveltekit-replacestate
				>
					{#if OptionIcon}
						<OptionIcon size={18} class="opacity-60" />
					{/if}
					<span class="whitespace-nowrap font-normal">{label}</span>
				</a>
			{:else}
				<div class="menu-item disabled px-10">
					<span class="opacity-40">{placeholder}</span>
				</div>
			{/each}
		</div>
	</DropDown>
</th>
