<script lang="ts">
	import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-svelte'
	import { tip, urlParam } from 'fuma'
	import type { Dayjs } from 'dayjs'
	import { goto } from '$app/navigation'
	import { daytz } from '$lib/dayjs'

	export let cursor: Dayjs
</script>

<div class="flex join join-horizontal">
	<a
		class="btn btn-square btn-sm join-item"
		type="button"
		use:tip={{ content: 'Semaine précédente' }}
		href={$urlParam.with({ cursor: cursor.add(-7, 'day').toJSON() })}
		data-sveltekit-replacestate
	>
		<ChevronLeftIcon size={16} />
	</a>

	<input
		class="input input-sm input-bordered join-item"
		type="date"
		value={cursor.format('YYYY-MM-DD')}
		on:input={async (event) => {
			const newDate = daytz(event.currentTarget.value)
			if (!newDate.isValid()) return
			goto($urlParam.with({ cursor: newDate.toJSON() }), { keepFocus: true, replaceState: true })
		}}
	/>

	<a
		class="btn btn-square btn-sm join-item"
		type="button"
		use:tip={{ content: 'Semaine suivante' }}
		href={$urlParam.with({ cursor: cursor.add(7, 'day').toJSON() })}
		data-sveltekit-replacestate
	>
		<ChevronRightIcon size={16} />
	</a>
</div>
