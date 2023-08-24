<script lang="ts">
	import { Card } from '$lib/material'
	import MemberFieldForm from './MemberFieldForm.svelte'
</script>

<Card>
	<span slot="title">Profil des membres</span>
	<span slot="subtitle">Informations complémentaires concernant vos membres</span>

	<MemberFieldForm />
</Card>
