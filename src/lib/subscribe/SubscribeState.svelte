<script lang="ts">
	import {
		mdiAlertOctagonOutline,
		mdiCheck,
		mdiCloseOctagonOutline,
		mdiTrashCanOutline,
	} from '@mdi/js'
	import type { Subscribe } from '@prisma/client'
	import { Icon } from 'fuma'

	let klass = ''
	export { klass as class }
	export let subscribe: Subscribe & { member: { isValidedByUser: boolean } }

	$: changeAuthor =
		(subscribe.createdBy === 'user') ===
		(subscribe.state === 'cancelled' || subscribe.state === 'request')
			? 'par le membre'
			: 'par un responsable'
</script>

{#if subscribe.state === 'request' && subscribe.createdBy === 'leader' && !subscribe.member.isValidedByUser}
	<Icon
		path={mdiAlertOctagonOutline}
		class="fill-error {klass}"
		title="En attente de validation du membre (inactif)"
		tippyProps={{ appendTo: 'parent' }}
	/>
{:else if subscribe.state === 'request'}
	<Icon
		path={mdiAlertOctagonOutline}
		class="fill-warning {klass}"
		title="En attente de validation {subscribe.createdBy === 'user'
			? `d'un responsable`
			: `du membre`}"
		tippyProps={{ appendTo: 'parent' }}
	/>
{:else if subscribe.state === 'accepted'}
	<Icon
		path={mdiCheck}
		class="fill-success {klass}"
		title="Inscription confirmée {changeAuthor}"
		tippyProps={{ appendTo: 'parent' }}
	/>
{:else if subscribe.state === 'denied'}
	<Icon
		path={mdiCloseOctagonOutline}
		class="fill-error {klass}"
		title="Inscription déclinée {changeAuthor}"
		tippyProps={{ appendTo: 'parent' }}
	/>
{:else if subscribe.state === 'cancelled'}
	<Icon
		path={mdiTrashCanOutline}
		class="fill-error {klass}"
		title="Inscription annulée {changeAuthor}"
		tippyProps={{ appendTo: 'parent' }}
	/>
{/if}
