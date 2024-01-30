<script lang="ts">
	import { dev } from '$app/environment'
	import { mdiCalendarStar, mdiLogin, mdiGiftOutline, mdiOpenInNew } from '@mdi/js'

	import { Icon, SectionCollapse } from '$lib/material'
	import { EventForm } from '$lib/event'
	import { MemberFields, MemberSettingsForm } from '$lib/member'
	import { GiftConfiguration } from '$lib/gift'
	import WorkInProgress from '$lib/WorkInProgress.svelte'
	import EventStateForm from './EventStateForm.svelte'
	import OnlyAdmin from '../OnlyAdmin.svelte'
	import { eventPath } from '$lib/store'

	export let data
</script>

<OnlyAdmin>
	<div class="grid gap-6 pt-4 place-content-center justify-stretch pb-36 px-0 md:px-20 lg:px-48">
		<EventStateForm
			event={data.event}
			eventCounts={data.eventCounts}
			eventLicenceAvailable={!!data.eventLicenceAvailable}
		/>

		<SectionCollapse value="infos">
			<span slot="title" class="flex gap-3">
				<Icon path={mdiCalendarStar} class="opacity-70" />
				L'évènement
			</span>
			<span slot="subtitle">Informations publiques relatives à ton évènement</span>
			<EventForm successReset={false} event={data.event} class="grow" />
		</SectionCollapse>

		<SectionCollapse value="membership">
			<span slot="title" class="flex gap-3">
				<Icon path={mdiLogin} class="opacity-70" />
				Adhésion des membres
			</span>
			<span slot="subtitle">Paramétrage du processus d'adhésion et d'inscription</span>

			<section>
				<MemberSettingsForm event={data.event} />
			</section>

			<div class="divider" />

			<section>
				<MemberFields fields={data.memberFields} />
			</section>

			<div class="divider" />

			<div class="flex justify-end">
				<a href="{$eventPath}/register?forcedStepIndex=1" target="_blank" class="btn btn-ghost">
					Aperçu du formulaire d'adhésion
					<Icon path={mdiOpenInNew} size={20} class="opacity-70" />
				</a>
			</div>
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
