<script lang="ts">
	import type { Gift, GiftCondition } from '@prisma/client'
	import { mdiAccountGroupOutline } from '@mdi/js'

	import { Icon } from 'fuma'

	import { slide } from 'svelte/transition'
	import Dialog from '$lib/material/Dialog.svelte'
	import GiftForm from './GiftForm.svelte'

	type GiftWithConditions = Gift & { conditions: GiftCondition[] }
	export let gifts: GiftWithConditions[]

	let dialog: HTMLDialogElement
	let selectedGift: GiftWithConditions | undefined = undefined

	function openEditDialog(gift?: GiftWithConditions) {
		selectedGift = gift
		dialog.showModal()
	}
</script>

{#each gifts as gift}
	<button
		transition:slide
		on:click={() => openEditDialog(gift)}
		class="
      w-full flex gap-3 py-3 px-4 items-center border rounded-lg
      bg-base-200/50 hover:bg-base-200 cursor-pointer text-left
    "
	>
		<div>
			<h3>{gift.name}</h3>
			<span class="text-sm opacity-70">10 / 17 distributions</span>
		</div>

		<a href="#todo" class="btn btn-square btn-sm btn-ghost ml-auto" on:click|stopPropagation>
			<Icon path={mdiAccountGroupOutline} title="Voir les attributions de {gift.name}" />
		</a>
	</button>
{/each}

<button class="btn" on:click={() => openEditDialog()}> Ajouter une prestation </button>

<Dialog bind:dialog>
	<h2 slot="header" class="card-title">
		{selectedGift ? 'Édition de la' : 'Nouvelle'} prestation
	</h2>

	<GiftForm bind:gift={selectedGift} />
</Dialog>
