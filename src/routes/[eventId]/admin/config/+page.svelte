<script lang="ts">
	import {
		mdiCalendarStar,
		mdiCardAccountDetailsOutline,
		mdiFormatPaint,
		mdiGiftOutline,
	} from '@mdi/js'

	import { Icon, SectionCollapse } from '$lib/material'
	import { EventForm, EventSettings, EventStateForm } from '$lib/event'
	import { MemberFields, MemberSettingsForm } from '$lib/member'
	import { GiftConfiguration } from '$lib/gift'
	import OnlyAdmin from '../OnlyAdmin.svelte'
	import WorkInProgress from '$lib/WorkInProgress.svelte'
	import { dev } from '$app/environment'

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
			<span slot="subtitle">Configuration du fonctionnement du site</span>
			<EventSettings event={data.event} />
		</SectionCollapse>

		<SectionCollapse value="member-profil">
			<span slot="title" class="flex gap-3">
				<Icon path={mdiCardAccountDetailsOutline} class="opacity-70" />
				Profil des membres
			</span>
			<span slot="subtitle">Définition des informations relatives aux membres</span>

			<section>
				<MemberSettingsForm event={data.event} />
			</section>

			<div class="divider" />

			<section>
				<MemberFields fields={data.memberFields} />
			</section>
		</SectionCollapse>

		{#if dev}
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
		{/if}
	</div>
</OnlyAdmin>
