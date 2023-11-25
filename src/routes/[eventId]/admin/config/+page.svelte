<script lang="ts">
	import { SectionCollapse } from '$lib/material'
	import EventForm from '$lib/EventForm.svelte'
	import MemberFields from '$lib/member/MemberFields.svelte'
	import { GiftConfiguration, GiftForm } from '$lib/gift'
	import OnlyAdmin from '../OnlyAdmin.svelte'
	import EventStateForm from './EventStateForm.svelte'

	export let data
</script>

<OnlyAdmin>
	<div class="grid gap-6 pt-4 place-content-center justify-stretch pb-36 px-0 md:px-20 lg:px-48">
		<EventStateForm event={data.event} />

		<SectionCollapse value="infos">
			<span slot="title">L'évènement</span>
			<span slot="subtitle">Informations publiques relatives à ton évènement</span>
			<EventForm isUpdate successReset={false} event={data.event} class="grow" />
		</SectionCollapse>

		<MemberFields fields={data.memberFields} />

		<SectionCollapse value="gifts" class="grow">
			<span slot="title">Prestations offertes</span>
			<span slot="subtitle">
				Liste et configuration des compensations auxquelles les membres ont droit
			</span>
			<GiftConfiguration gifts={data.gifts} />
		</SectionCollapse>
	</div>
</OnlyAdmin>
