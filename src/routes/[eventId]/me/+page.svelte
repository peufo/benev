<script lang="ts">
	import {
		ClipboardListIcon,
		IdCardIcon,
		MapPinnedIcon,
		OctagonAlertIcon,
		SettingsIcon,
	} from '@lucide/svelte'
	import { eventPath } from '$lib/eventPath'
	import TeamsSubscribes from '$lib/me/TeamsSubscribes.svelte'
	import {
		MemberProfileForm,
		MemberProfileStatus,
		MemberRole,
		MemberSettingsForm,
		MemberDeleteForm,
	} from '$lib/member'
	import DownloadSubscribes from '$lib/me/DownloadSubscribes.svelte'
	import Section from '$lib/ui/Section.svelte'

	let { data } = $props()
</script>

<div class="max-w-2xl mx-auto space-y-3 mb-20">
	<Section id="subscribes" title="Mes inscriptions" icon={ClipboardListIcon}>
		<TeamsSubscribes teams={data.memberTeams} />

		{#if data.memberTeams.length}
			<div class="flex justify-between gap-2 border-t border-soft pt-4">
				{#if data.event.selfSubscribeAllowed}
					<a href={eventPath('/teams')} class="btn btn-sm">
						<MapPinnedIcon size={20} class="opacity-70" />
						<span>Voir les secteurs</span>
					</a>
				{/if}
				<div class="ml-auto">
					<DownloadSubscribes />
				</div>
			</div>
		{/if}
	</Section>

	{#if data.member.event.memberFields.filter((f) => f.memberCanRead).length}
		<Section id="profile" title="Mon profil" icon={IdCardIcon}>
			<div class="flex flex-wrap items-center gap-2">
				<MemberRole roles={data.member.roles} />
				<MemberProfileStatus member={data.member} />
			</div>
			<MemberProfileForm compact saveBar memberProfile={data.member} />
		</Section>
	{/if}

	<Section id="settings" title="Mes préférences" icon={SettingsIcon}>
		<MemberSettingsForm member={data.member} />
	</Section>

	<Section
		id="danger"
		title="Suppression des données"
		subtitle="Cette opération est irréversible"
		icon={OctagonAlertIcon}
		danger
	>
		<MemberDeleteForm memberId={data.member.id} class="w-max mt-2" />
	</Section>
</div>
