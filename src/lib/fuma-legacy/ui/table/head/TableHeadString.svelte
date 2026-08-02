<script lang="ts" generics="Item extends {id: string}">
	import { SearchIcon } from '@lucide/svelte'
	import type { TippyInstance } from 'fuma'
	import { untrack } from 'svelte'
	import { page } from '$app/stores'

	import { DropDown } from 'fuma'
	import { InputSearch } from '$lib/ui'
	import type { TableField } from '$lib/fuma-legacy/ui/table/index.js'

	interface Props {
		field: TableField<Item>
	}

	let { field }: Props = $props()

	let tip: TippyInstance = $state()!
	// Saisie de l'utilisateur, amorcée par l'URL: `field.key` ne change pas d'une colonne.
	let searchValue = $state($page.url.searchParams.get(untrack(() => field.key)) || '')
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
			<button class="menu-item min-h-8 w-full flex-wrap gap-y-1">
				<div class="flex items-center gap-2">
					<span>{field.label}</span>
					{#if !searchValue}
						<SearchIcon size={15} class="opacity-50" />
					{/if}
				</div>

				{#if searchValue}
					<span class="badge badge-primary badge-xs text-[0.7rem] font-normal text-white">
						<SearchIcon size={10} class="-translate-x-1 text-white/80" />
						<span>{searchValue}</span>
					</span>
				{/if}
			</button>
		{/snippet}

		<InputSearch
			class="m-1"
			key={field.key}
			bind:value={searchValue}
			onkeydown={(e) => e.key === 'Enter' && tip.hide()}
		/>
	</DropDown>
</th>
