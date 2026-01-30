<script lang="ts">
	import BadgeForm from './BadgeForm.svelte'
	import BadgeView from './BadgeView.svelte'

	export let data
</script>

<div class="flex">
	<BadgeForm badge={data.badge} />
	<div class="divider divider-horizontal" />
	<BadgeView badge={data.badge} />
</div>
