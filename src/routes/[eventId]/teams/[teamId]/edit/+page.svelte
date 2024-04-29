<script lang="ts">
	import { Card } from 'fuma'
	import { TeamForm } from '$lib/team'

	export let data
</script>

<Card class="bg-base-100 m-auto max-w-md">
	<TeamForm isUpdate team={data.team} event={data.event} />
</Card>
