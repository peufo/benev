<script lang="ts">
	import BadgeForm from './BadgeForm.svelte'
	import BadgeView from './BadgeView.svelte'

	let { data } = $props()

	let view = $state<ReturnType<typeof BadgeView>>()
</script>

<div class="flex gap-12 pl-12">
	<BadgeForm badge={data.badge} onsaved={() => view?.refresh()} />
	<div class="divider divider-horizontal"></div>
	<BadgeView bind:this={view} badge={data.badge} defaultMember={data.member} />
</div>
