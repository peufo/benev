<script lang="ts">
	import { PlusIcon, ExternalLinkIcon, FilterIcon, DownloadIcon, PencilIcon } from '@lucide/svelte'
	import { tip } from 'fuma'
	import { Surface } from '$lib/ui'
</script>

{#snippet squareButton(label: string, Icon: typeof PlusIcon, secondary = false)}
	<button
		type="button"
		class={['btn btn-square btn-sm', secondary && 'btn-secondary']}
		use:tip={{ content: label }}
	>
		<Icon size={20} class={secondary ? '' : 'opacity-70'} />
	</button>
{/snippet}

<div class="max-w-3xl mx-auto p-4 space-y-3">
	<h1 class="title">Surface</h1>

	<Surface title="Titre seul">
		<p class="p-1 text-sm text-base-content/70">Contenu nu, sans actions.</p>
	</Surface>

	<Surface title="Titre et sous-titre" subtitle="12 adhérent·es à ce jour">
		<p class="p-1 text-sm text-base-content/70">Le sous-titre porte une donnée, pas une phrase.</p>
	</Surface>

	<Surface title="Avec retour" back>
		<p class="p-1 text-sm text-base-content/70">Le bouton de retour tient la place de l'icône.</p>
	</Surface>

	<Surface title="Avec actions">
		{#snippet action()}
			<div class="join">
				<button type="button" class="btn join-item btn-sm btn-primary">Derniers</button>
				<button type="button" class="btn join-item btn-sm">Tous</button>
			</div>
			{@render squareButton('Voir tout', ExternalLinkIcon)}
			{@render squareButton('Ajouter', PlusIcon, true)}
		{/snippet}
		<p class="p-1 text-sm text-base-content/70">Un filtre et deux boutons carrés.</p>
	</Surface>

	<Surface
		title="Un titre assez long pour pousser les actions à la ligne sur un écran étroit"
		subtitle="Et un sous-titre qui suit"
		back
	>
		{#snippet action()}
			{@render squareButton('Filtrer', FilterIcon)}
			{@render squareButton('Télécharger', DownloadIcon)}
			{@render squareButton('Modifier', PencilIcon, true)}
			{@render squareButton('Ajouter', PlusIcon, true)}
		{/snippet}
		<p class="p-1 text-sm text-base-content/70">Les actions se replient sous le titre.</p>
	</Surface>

	<Surface>
		<p class="p-1 text-sm text-base-content/70">Sans entête: seulement la surface.</p>
	</Surface>

	<Surface title="Contenu défilant" class="flex flex-col h-64">
		{#snippet action()}
			{@render squareButton('Filtrer', FilterIcon)}
		{/snippet}
		<ul class="grow overflow-y-auto divide-y divide-base-300">
			{#each { length: 30 } as _, i (i)}
				<li class="px-1 py-2 text-sm">Entrée {i + 1}</li>
			{/each}
		</ul>
	</Surface>
</div>
