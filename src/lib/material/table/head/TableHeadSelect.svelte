<script lang="ts">
	import { jsonParse } from '$lib/jsonParse'
	import { type Options, type TableField, parseOptions, DropDown, Icon } from '$lib/material'
	import { urlParam } from '$lib/store'

	export let field: TableField
	export let options: Options
	export let multiSelect = false

	let select: {
		getActive(value: string): boolean
		getHref(value: string): string
	}

	urlParam.subscribe((params) => {
		const selection = params.get(field.key)
		const selections = jsonParse<string[]>(params.get(field.key), [])
		select = {
			getActive(value: string) {
				if (!multiSelect) return selection === value
				return selections.includes(value)
			},
			getHref(value: string) {
				if (!multiSelect) return params.toggle({ [field.key]: value })
				if (selections.includes(value)) {
					const newSelections = selections.filter((v) => v !== value)
					if (!newSelections.length) return params.without(field.key)
					return params.with({ [field.key]: JSON.stringify(newSelections) })
				}
				return params.with({ [field.key]: JSON.stringify([...selections, value]) })
			},
		}
	})

	$: _options = parseOptions(options).map((option) => ({
		...option,
		active: select.getActive(option.value),
	}))
	$: _optionsActive = _options.filter((option) => option.active)
</script>

<th class="p-1">
	<DropDown hideOnBlur hideOnNav={!multiSelect} tippyProps={{ appendTo: () => document.body }}>
		<button slot="activator" class="menu-item w-full flex-wrap gap-y-1">
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
