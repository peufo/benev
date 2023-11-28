<script lang="ts">
	import { Icon, SectionCollapse } from '$lib/material'
	import EventForm from '$lib/EventForm.svelte'
	import MemberFields from '$lib/member/MemberFields.svelte'
	import { GiftConfiguration, GiftForm } from '$lib/gift'
	import OnlyAdmin from '../OnlyAdmin.svelte'
	import EventStateForm from './EventStateForm.svelte'
	import WorkInProgress from '$lib/WorkInProgress.svelte'
	import {
		mdiCalendarStar,
		mdiCardAccountDetailsOutline,
		mdiFormatPaint,
		mdiGiftOutline,
	} from '@mdi/js'

	export let data
</script>

<OnlyAdmin>
	<div class="grid gap-6 pt-4 place-content-center justify-stretch pb-36 px-0 md:px-20 lg:px-48">
		<EventStateForm event={data.event} />

		<SectionCollapse value="infos">
			<span slot="title" class="flex gap-3">
				<Icon path={mdiCalendarStar} class="opacity-70" />
				L'évènement
			</span>
			<span slot="subtitle">Informations publiques relatives à ton évènement</span>
			<EventForm isUpdate successReset={false} event={data.event} class="grow" />
		</SectionCollapse>

		<SectionCollapse value="settings">
			<span slot="title" class="flex gap-3">
				<Icon path={mdiFormatPaint} class="opacity-70 -rotate-6" />
				Préférences
			</span>
			<span slot="subtitle">Configuration de l'aspect et du fonctionnement du site</span>
			<WorkInProgress />
		</SectionCollapse>

		<SectionCollapse value="member-profil">
			<span slot="title" class="flex gap-3">
				<Icon path={mdiCardAccountDetailsOutline} class="opacity-70" />
				Profil des membres
			</span>
			<span slot="subtitle">Informations complémentaires concernant vos membres</span>
			<MemberFields fields={data.memberFields} />
		</SectionCollapse>

		<SectionCollapse value="gifts" class="grow">
			<span slot="title" class="flex gap-3">
				<Icon path={mdiGiftOutline} class="opacity-70 -rotate-6" />
				Prestations offertes
			</span>
			<span slot="subtitle">
				Liste et configuration des compensations auxquelles les membres ont droit
			</span>

			<WorkInProgress />
			<GiftConfiguration gifts={data.gifts} />
		</SectionCollapse>
	</div>
</OnlyAdmin>
