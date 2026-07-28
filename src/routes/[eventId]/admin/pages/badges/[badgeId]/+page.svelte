<script lang="ts">
	import BadgeForm from './BadgeForm.svelte'
	import BadgeView from './BadgeView.svelte'

	let { data = $bindable() } = $props()
</script>

<div class="flex gap-12 pl-12">
	<BadgeForm bind:badge={data.badge} />
	<div class="divider divider-horizontal"></div>
	<BadgeView badge={data.badge} defaultMember={data.member} />
</div>
