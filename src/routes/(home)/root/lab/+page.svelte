<script lang="ts">
	import { Card, InputHtml } from '$lib/material'

	let value = 'YOOO'
</script>

<Card class="max-w-3xl mx-auto">
	<InputHtml bind:value valueAsHTML />
</Card>
