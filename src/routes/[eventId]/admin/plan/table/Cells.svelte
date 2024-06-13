<script lang="ts">
	import type { Dayjs } from 'dayjs'
	import type { Period } from 'fuma'

	export let periods: Period[]
	export let row: number
	export let range: { start: Dayjs; end: Dayjs }

	type Cell = {
		colSpan: number
		content: string
		isSlot: boolean
	}

	const cells: Cell[] = []
</script>
