<script lang="ts">
	import { type Options, type TableField, parseOptions, DropDown, Icon } from '$lib/material'
	import { urlParam } from '$lib/store'

	export let field: TableField

	export let options: Options
	$: _options = parseOptions(options).map((option) => ({
		...option,
		active: $urlParam.hasValue(field.key, option.value),
	}))
	$: _optionsActive = _options.filter((option) => option.active)

	let button: HTMLButtonElement
</script>

<th class="p-1">
	<DropDown hideOnBlur>
		<button bind:this={button} slot="activator" class="menu-item w-full flex-wrap gap-y-1">
			<span>{field.label}</span>

			{#if _optionsActive.length}
				<div class="flex flex-wrap gap-1">
					{#each _optionsActive as option}
						<span class="badge badge-primary badge-outline text-xs font-normal">
							{#if option.icon}
								<Icon path={option.icon} size={15} class="opacity-60 -translate-x-[3px]" />
							{/if}
							{option.label}
						</span>
					{/each}
				</div>
			{/if}
		</button>

		{#each _options as option}
			<a
				href={$urlParam.toggle({ [field.key]: option.value })}
				class="menu-item px-3 py-2"
				class:active={option.active}
			>
				{#if option.icon}
					<Icon path={option.icon} size={18} class="opacity-60" />
				{/if}
				<span class="whitespace-nowrap font-normal">{option.label}</span>
			</a>
		{/each}
	</DropDown>
</th>
