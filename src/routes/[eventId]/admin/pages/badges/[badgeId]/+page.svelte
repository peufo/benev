<script lang="ts">
	import { ArrowLeftIcon } from '@lucide/svelte'
	import { eventPath } from '$lib/eventPath'
	import { Surface } from '$lib/ui'
	import BadgeForm from './BadgeForm.svelte'
	import BadgeView from './BadgeView.svelte'

	let { data } = $props()

	let view = $state<ReturnType<typeof BadgeView>>()
</script>

<a href={eventPath('/admin/pages')} class="btn btn-ghost btn-sm my-3 md:hidden">
	<ArrowLeftIcon size={20} class="opacity-70" />
	<span>Toutes les publications</span>
</a>

<div class="flex flex-col items-start gap-3 xl:flex-row">
	<Surface id="badge-form" title="Configuration d'un badge" class="w-full min-w-0">
		<BadgeForm badge={data.badge} onsaved={() => view?.refresh()} />
	</Surface>

	<Surface id="badge-preview" title="Aperçu" class="w-full shrink-0 xl:sticky xl:top-1 xl:w-96">
		<BadgeView bind:this={view} badge={data.badge} defaultMember={data.member} />
	</Surface>
</div>
