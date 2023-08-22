<script lang="ts">
	import { Card } from '$lib/material'
	import EventForm from '../../../EventForm.svelte'
	import ShareForm from './ShareForm.svelte'
	import WorkInProgress from '$lib/WorkInProgress.svelte'
	import MemberFields from './MemberFields.svelte'

	export let data
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
	<Card class="row-span-2">
		<span slot="title">Informations de base</span>
		<EventForm isUpdate successReset={false} event={data.event} class="grow" />
	</Card>

	<Card>
		<span slot="title">Partage</span>
		<ShareForm />
	</Card>

	<MemberFields />
</div>
