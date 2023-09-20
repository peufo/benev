<script lang="ts">
	import {
		mdiAlertOctagonOutline,
		mdiCheck,
		mdiCloseOctagonOutline,
		mdiTrashCanOutline,
	} from '@mdi/js'
	import type { Subscribe } from '@prisma/client'
	import { Icon } from '$lib/material'

	let klass = ''
	export { klass as class }
	export let subscribe: Subscribe

	$: changeAuthor =
		(subscribe.createdBy === 'user') ===
		(subscribe.state === 'cancelled' || subscribe.state === 'request')
			? 'par le membre'
			: 'par un responsable'
</script>

{#if subscribe.state === 'request'}
	<Icon
		path={mdiAlertOctagonOutline}
		class="fill-warning {klass}"
		title="En attente de validation {subscribe.createdBy === 'user'
			? `d'un responsable`
			: `du membre`}"
	/>
{:else if subscribe.state === 'accepted'}
	<Icon path={mdiCheck} class="fill-success {klass}" title="Inscription confirmée {changeAuthor}" />
{:else if subscribe.state === 'denied'}
	<Icon
		path={mdiCloseOctagonOutline}
		class="fill-error {klass}"
		title="Inscription refusée {changeAuthor}"
	/>
{:else if subscribe.state === 'cancelled'}
	<Icon
		path={mdiTrashCanOutline}
		class="fill-error {klass}"
		title="Inscription annulée {changeAuthor}"
	/>
{/if}
