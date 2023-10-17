<script lang="ts">
	import { mdiPencilOutline, mdiPlus } from '@mdi/js'
	import { DropDown, Icon } from '$lib/material'
	import { Period } from '@prisma/client'
	import PeriodForm from './PeriodForm.svelte'
	import type { Props as TippyProps } from 'tippy.js'

	let dropdown: DropDown
	export let period: Period | undefined = undefined
	export let tippyProps: Partial<TippyProps> = {}

	export function show(_period: Period) {
		period = _period
		dropdown.show()
	}

	export function hide() {
		dropdown.hide()
	}
</script>

<DropDown bind:this={dropdown} {tippyProps} class="max-h-none">
	<button slot="activator" class="btn btn-sm" class:btn-square={!!period}>
		{#if !!period}
			<Icon path={mdiPencilOutline} size={22} title="Éditer la période" />
		{:else}
			<Icon path={mdiPlus} size={22} title="Ajouter une période" />
			<span>Ajouter</span>
		{/if}
	</button>

	<PeriodForm {period} on:success />
</DropDown>
