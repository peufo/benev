<script lang="ts">
	import { page } from '$app/state'
	import TeamsList from './TeamsList.svelte'

	let { data, children } = $props()

	// Les deux volets ne cohabitent pas sous `md`: c'est la présence d'un secteur dans l'URL qui
	// décide lequel occupe l'écran, et le retour arrière du navigateur rejoue la bascule.
	const selected = $derived(!!page.params.teamId)
</script>

<div class="flex items-start gap-3">
	<aside
		class={[
			'surface p-2 w-full shrink-0 md:w-72 md:sticky md:top-1',
			'max-h-main overflow-auto',
			selected && 'max-md:hidden',
		]}
	>
		<TeamsList teams={data.teams} myTeamIds={data.myTeamIds} />
	</aside>

	<div class={['grow min-w-0', !selected && 'max-md:hidden']}>
		{@render children?.()}
	</div>
</div>
