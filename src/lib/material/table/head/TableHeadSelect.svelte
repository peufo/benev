<script lang="ts">
	import { page } from '$app/stores'
	import { jsonParse } from '$lib/jsonParse'
	import { type Options, type TableField, parseOptions, DropDown, Icon } from '$lib/material'
	import { urlParam } from '$lib/store'

	export let field: TableField
	export let options: Options
	export let multiSelect = false

	let select = createSelect($page.url)
	page.subscribe(({ url }) => (select = createSelect(url)))

	function createSelect({ searchParams }: URL) {
		const selection = searchParams.get(field.key)
		const selections = jsonParse<string[]>(searchParams.get(field.key), [])
		return {
			getActive(value: string) {
				if (!multiSelect) return selection === value
				return selections.includes(value)
			},
			getHref(value: string) {
				if (!multiSelect) return $urlParam.toggle({ [field.key]: value }, 'skip', 'take')
				if (selections.includes(value)) {
					const newSelections = selections.filter((v) => v !== value)
					if (!newSelections.length) return $urlParam.without(field.key)
					return $urlParam.with({ [field.key]: JSON.stringify(newSelections) }, 'skip', 'take')
				}
				return $urlParam.with(
					{ [field.key]: JSON.stringify([...selections, value]) },
					'skip',
					'take'
				)
			},
		}
	}

	$: _options = parseOptions(options)
		.filter(Boolean)
		.map((option) => ({
			...option,
			active: select.getActive(option.value),
		}))
	$: _optionsActive = _options.filter((option) => option.active)
</script>

<th class="p-1">
	<DropDown hideOnBlur hideOnNav={!multiSelect} tippyProps={{ appendTo: () => document.body }}>
		<button slot="activator" class="menu-item w-full flex-wrap gap-y-1 min-h-8">
			<span>{field.label}</span>

			{#if _optionsActive.length}
				<div class="flex flex-wrap gap-1">
					{#each _optionsActive as option}
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
			{#each _options as option}
				<a
					href={select.getHref(option.value)}
					class="menu-item px-3 py-2"
					class:active={option.active}
					data-sveltekit-noscroll
					data-sveltekit-replacestate
				>
					{#if option.icon}
						<Icon path={option.icon} size={18} class="opacity-60" />
					{/if}
					<span class="whitespace-nowrap font-normal">{option.label}</span>
				</a>
			{/each}
		</div>
	</DropDown>
</th>
