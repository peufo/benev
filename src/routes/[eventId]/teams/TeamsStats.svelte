<script lang="ts">
	import type { PageServerData } from './$types'

	export let teams: PageServerData['teams']
</script>

<div class="flex gap-2">
	<span class="badge">{teams.length} Secteurs</span>
	<span class="badge">
		{teams.reduce((acc, cur) => {
			return acc + cur.periods.length
		}, 0)} Périodes
	</span>
</div>
