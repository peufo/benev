<script lang="ts">
	import type { PageServerData } from './$types'
	export let teams: PageServerData['teams']
</script>

<div class="flex gap-2">
	<span class="badge">{teams.length} Secteurs</span>
	<span class="badge">
		{teams.reduce((acc, cur) => acc + cur.periods.length, 0)} Périodes
	</span>
	<span class="badge">
		{teams.reduce((acc, cur) => acc + cur.nbSubscribes, 0)} /
		{teams.reduce((acc, cur) => acc + cur.maxSubscribes, 0)} Inscriptions
	</span>
</div>
