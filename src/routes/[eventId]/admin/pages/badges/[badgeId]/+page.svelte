<script lang="ts">
	import { SelectMedia } from '$lib/material'
	import BadgeForm from './BadgeForm.svelte'

	export let data
</script>

<div class="flex">
	<BadgeForm badge={data.badge} />
</div>
