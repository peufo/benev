<script lang="ts">
	import { SectionCollapse } from '$lib/material'
	import EventForm from '$lib/EventForm.svelte'
	import MemberFields from '$lib/member/MemberFields.svelte'
	import OnlyAdmin from '../OnlyAdmin.svelte'
	import EventStateForm from './EventStateForm.svelte'

	export let data
</script>

<OnlyAdmin>
	<div class="grid gap-6 pt-4 place-content-center justify-stretch pb-36 px-0 md:px-20 lg:px-48">
		<EventStateForm event={data.event} />

		<SectionCollapse value="infos" class="grow">
			<span slot="title">Paramètres et préférences</span>
			<EventForm isUpdate successReset={false} event={data.event} class="grow" />
		</SectionCollapse>

		<MemberFields fields={data.memberFields} />
	</div>
</OnlyAdmin>
