<script lang="ts">
	import { page } from '$app/stores'
	import { eventPath } from '$lib/store'
	import { tip, DropDown } from 'fuma'
	import { IdCardLanyardIcon } from 'lucide-svelte'

	export let params: string = ''
	export let title = 'Imprimer les badges'
	export let badges: { id: string; name: string }[]

	$: _params = params || $page.url.searchParams.toString()
</script>

{#if badges.length === 1}
	{@const badge = badges[0]}
	<a
		href="{$eventPath}/admin/pages/badges/{badge.id}/pdf?{_params}"
		target="_blank"
		class="btn btn-square btn-sm"
		use:tip={{ content: title }}
	>
		<IdCardLanyardIcon size="20" opacity={0.9} />
	</a>
{:else if badges.length > 1}
	<DropDown>
		<button slot="activator" class="btn btn-square btn-sm" use:tip={{ content: title }}>
			<IdCardLanyardIcon size="20" opacity={0.9} />
		</button>
		<ul class="menu">
			{#each badges as badge}
				<li>
					<a href="{$eventPath}/admin/pages/badges/{badge.id}/pdf?{_params}" target="_blank">
						{badge.name}
					</a>
				</li>
			{/each}
		</ul>
	</DropDown>
{/if}
