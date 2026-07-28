<script lang="ts">
	import { page } from '$app/stores'
	import { eventPath } from '$lib/store'
	import { tip, DropDown } from '$lib/fuma'
	import { IdCardLanyardIcon } from '@lucide/svelte'

	interface Props {
		params?: string;
		title?: string;
		badges: { id: string; name: string }[];
	}

	let { params = '', title = 'Imprimer les badges', badges }: Props = $props();

	let _params = $derived(params || $page.url.searchParams.toString())
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
		{#snippet activator()}
						<button  class="btn btn-square btn-sm" use:tip={{ content: title }}>
				<IdCardLanyardIcon size="20" opacity={0.9} />
			</button>
					{/snippet}
		<ul class="menu">
			{#each badges as badge (badge.id)}
				<li>
					<a href="{$eventPath}/admin/pages/badges/{badge.id}/pdf?{_params}" target="_blank">
						{badge.name}
					</a>
				</li>
			{/each}
		</ul>
	</DropDown>
{/if}
