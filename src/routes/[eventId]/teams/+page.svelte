<script lang="ts">
	import { mdiPlus } from '@mdi/js'
	import { Icon, InputSearch, urlParam } from 'fuma'
	import { Teams, ToggleOnlyAvailable } from '$lib/team'

	export let data
</script>

<div class="max-w-xl m-auto flex flex-col gap-4">
	<div class="flex gap-2 p-2 bg-base-100 rounded-2xl">
		<InputSearch />
		<div class="grow" />
		<ToggleOnlyAvailable />

		{#if data.member?.roles.includes('admin')}
			<a
				href={$urlParam.with({ form_team: 1 })}
				class="btn btn-sm btn-square"
				data-sveltekit-noscroll
				data-sveltekit-replacestate
			>
				<Icon path={mdiPlus} title="Nouveau secteur" />
			</a>
		{/if}
	</div>

	<Teams teams={data.teams} />
</div>
