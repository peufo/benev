<script lang="ts">
	import type { Instance as TippyInstance } from 'tippy.js'
	import { mdiMagnify } from '@mdi/js'
	import { DropDown, Icon, InputSearch, type TableField } from '$lib/material'
	import { page } from '$app/stores'

	export let field: TableField

	let tip: TippyInstance
	let searchValue = $page.url.searchParams.get(field.key) || ''
</script>

<th class="p-1">
	<DropDown
		bind:tip
		hideOnBlur
		hideOnNav={false}
		autofocus
		tippyProps={{ appendTo: () => document.body }}
	>
		<button slot="activator" class="menu-item w-full flex-wrap gap-y-1 min-h-8">
			<span>{field.label}</span>

			{#if searchValue}
				<span class="badge badge-primary badge-xs text-[0.7rem] font-normal text-white">
					<Icon path={mdiMagnify} size={10} class="-translate-x-1 fill-white/80" />
					<span>{searchValue}</span>
				</span>
			{/if}
		</button>

		<InputSearch
			class="m-1"
			key={field.key}
			bind:value={searchValue}
			on:keydown={(e) => e.key === 'Enter' && tip.hide()}
		/>
	</DropDown>
</th>
