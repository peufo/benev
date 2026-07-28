<script lang="ts" generics="Item extends {id: string}">
	import type { TippyInstance } from '$lib/fuma/utils/tippy.js'
	import { mdiMagnify } from '@mdi/js'
	import { page } from '$app/stores'

	import { DropDown } from '$lib/fuma/ui/menu/index.js'
	import { Icon } from '$lib/fuma/ui/icon/index.js'
	import { InputSearch } from '$lib/fuma/ui/input/index.js'
	import type { TableField } from '$lib/fuma/ui/table/index.js'

	interface Props {
		field: TableField<Item>;
	}

	let { field }: Props = $props();

	let tip: TippyInstance = $state()
	let searchValue = $state($page.url.searchParams.get(field.key) || '')
</script>

<th class="p-1">
	<DropDown
		bind:tip
		hideOnBlur
		hideOnNav={false}
		autofocus
		tippyProps={{ appendTo: () => document.body }}
	>
		{#snippet activator()}
				<button  class="menu-item min-h-8 w-full flex-wrap gap-y-1">
				<div class="flex items-center gap-2">
					<span>{field.label}</span>
					{#if !searchValue}
						<Icon path={mdiMagnify} size={15} class="opacity-50" />
					{/if}
				</div>

				{#if searchValue}
					<span class="badge badge-primary badge-xs text-[0.7rem] font-normal text-white">
						<Icon path={mdiMagnify} size={10} class="-translate-x-1 fill-white/80" />
						<span>{searchValue}</span>
					</span>
				{/if}
			</button>
			{/snippet}

		<InputSearch
			class="m-1"
			key={field.key}
			bind:value={searchValue}
			on:keydown={(e) => e.key === 'Enter' && tip.hide()}
		/>
	</DropDown>
</th>
