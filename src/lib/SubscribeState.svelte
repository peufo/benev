<script lang="ts">
	import { mdiAlertOctagonOutline, mdiCheck, mdiCloseOctagonOutline } from '@mdi/js'
	import type { SubscribeState } from '@prisma/client'
	import { Icon } from '$lib/material'

	let klass = ''
	export { klass as class }
	export let state: SubscribeState
</script>

{#if state === 'request'}
	<Icon
		path={mdiAlertOctagonOutline}
		class="fill-warning {klass}"
		title="En attente de validation"
	/>
{:else if state === 'accepted'}
	<Icon path={mdiCheck} class="fill-success {klass}" title="Inscription confirmée" />
{:else if state === 'denied'}
	<Icon path={mdiCloseOctagonOutline} class="fill-error {klass}" title="Inscription refusée" />
{/if}
