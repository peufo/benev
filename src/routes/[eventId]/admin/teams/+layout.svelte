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
			'surface p-0 w-full shrink-0 md:w-80 md:sticky md:top-1',
			'flex flex-col max-h-main overflow-hidden',
			selected && 'max-md:hidden',
		]}
	>
		<!-- Le défilement vit sous la carte: porté par elle, la barre de défilement serait peinte
		     en carré par-dessus ses coins arrondis. -->
		<div class="overflow-auto p-2">
			<TeamsList teams={data.teams} myTeamIds={data.myTeamIds} />
		</div>
	</aside>

	<div class={['grow min-w-0', !selected && 'max-md:hidden']}>
		{@render children?.()}
	</div>
</div>
