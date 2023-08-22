<script lang="ts">
	import WorkInProgress from '$lib/WorkInProgress.svelte'
	import { Card } from '$lib/material'
	import MemberField from './MemberField.svelte'
</script>

<WorkInProgress>
	<Card>
		<span slot="title">Profil des membres</span>
		<span slot="subtitle">Informations complémentaires demandées aux bénévoles</span>

		<MemberField />
	</Card>
</WorkInProgress>
