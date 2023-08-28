<script lang="ts">
	import { Card } from '$lib/material'
	import EventForm from '$lib/EventForm.svelte'
	import ShareForm from './ShareForm.svelte'
	import MemberFields from '$lib/member/MemberFields.svelte'

	export let data
</script>

<div class="grid grid-cols-1 gap-4 md:grid-cols-2 items-start">
	<Card>
		<span slot="title">Informations de base</span>
		<EventForm isUpdate successReset={false} event={data.event} class="grow" />
	</Card>

	<div class="flex flex-col gap-4">
		<Card>
			<span slot="title">Partage</span>
			<ShareForm />
		</Card>

		<MemberFields fields={data.memberFields} />
	</div>
</div>
