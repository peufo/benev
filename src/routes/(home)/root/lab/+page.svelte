<script lang="ts">
	import { Card, InputTextRich } from '$lib/material'

	let value = 'YOOO'
</script>

<Card class="max-w-3xl mx-auto">
	<InputTextRich bind:value valueAsHTML />
</Card>
