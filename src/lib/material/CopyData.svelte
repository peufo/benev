<script lang="ts">
	import { mdiTrayArrowDown } from '@mdi/js'
	import { Icon } from '$lib/material'
	import { useNotify } from '$lib/notify'

	type Item = $$Generic

  export let getData: () => Promise<Item[]>
  export let columns: Record<string, (item: Item) => string | number>

	const notify = useNotify()
	let isLoading = false

	async function handleCopy() {
		if (isLoading) return
		isLoading = true
		const items = await getData().finally(() => (isLoading = false))
		const csv = getCSV(items)

		navigator.clipboard
			.writeText(csv)
			.then(() => {
				notify.success(`Données prêtes à être collé dans un tableur`)
			})
			.catch((error) => {
				notify.error(error)
			})
	}

	function getCSV(members: Item[]): string {

		const headers = Object.keys(columns).join('\t')
		const rows = members.map((m: Item) =>
			Object.values(columns)
				.map((getValue) => getValue(m))
				.join('\t')
		)
		return [headers, rows.join('\r\n')].join('\r\n')
	}
</script>

<div class="relative">
	{#if isLoading}
		<span class="absolute left-1 top-1 loading loading-spinner scale-125 text-secondary" />
	{/if}
	<button class="btn btn-square btn-sm" on:click={handleCopy} class:btn-disabled={isLoading}>
		<Icon
			path={mdiTrayArrowDown}
			size={20}
			title="Copier les données"
			class="transition-transform {isLoading ? 'scale-75' : ''}"
		/>
	</button>
</div>
