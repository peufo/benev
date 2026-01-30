<script lang="ts">
	import BadgeForm from './BadgeForm.svelte'

	export let data
</script>

<div class="flex">
	<BadgeForm badge={data.badge} />
</div>
