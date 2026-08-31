<script lang="ts">
	import { tip } from 'fuma'
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
		{#snippet action()}
			{#if data.event.selfSubscribeAllowed}
				<a
					href={eventPath('/teams')}
					class="btn btn-square btn-sm ml-auto"
					use:tip={{ content: 'Voir les secteurs' }}
				>
					<MapPinnedIcon size={20} />
				</a>
			{/if}
			{#if data.memberTeams.length}
				<DownloadSubscribes />
			{/if}
		{/snippet}
		<TeamsSubscribes teams={data.memberTeams} />
	</Section>

	{#if data.member.event.memberFields.filter((f) => f.memberCanRead).length}
		<Section id="profile" title="Mon profil" icon={IdCardIcon}>
			{#snippet action()}
				<MemberRole roles={data.member.roles} />
				<MemberProfileStatus member={data.member} />
			{/snippet}
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
