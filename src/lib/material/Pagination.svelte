<script lang="ts">
	import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
	import { Icon } from '$lib/material'
	import { urlParam } from '$lib/store'

  export let take = 20

	$: skip = +($urlParam.get('skip') || 0)
	$: _take = +($urlParam.get('take') || take)

</script>

<div class="join">
	<a
		href={$urlParam.with({ skip: skip - _take, take: _take })}
		data-sveltekit-replacestate
    class:btn-disabled={skip - _take < 0 }
		class="join-item btn btn-sm btn-square"
	>
		<Icon path={mdiChevronLeft} title="Afficher les données précédentes" />
	</a>
	<a
		href={$urlParam.with({ skip: skip + _take, take: _take })}
		data-sveltekit-replacestate
		class="join-item btn btn-sm pr-1"
	>
		{skip + 1} - {skip + _take}
		<Icon path={mdiChevronRight} title="Afficher les données suivantes" />
	</a>
</div>
