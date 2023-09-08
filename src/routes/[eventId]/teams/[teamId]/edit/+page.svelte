<script lang="ts">
	import { Card } from '$lib/material'
	import TeamForm from '../../TeamForm.svelte'

	export let data
</script>

<Card class="max-w-lg m-auto">
	<TeamForm isUpdate team={data.team} />
</Card>
