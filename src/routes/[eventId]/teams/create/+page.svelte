<script lang="ts">
	import { Card } from '$lib/material'
	import TeamForm from '../TeamForm.svelte'
	export let data
</script>

<Card class="bg-base-100 m-auto max-w-md">
	<TeamForm event={data.event}/>
</Card>
