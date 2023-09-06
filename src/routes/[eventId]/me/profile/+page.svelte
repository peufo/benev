<script lang="ts">
	import MemberForm from '$lib/MemberForm.svelte'
	import { Card } from '$lib/material'
	import Profile from '$lib/me/ProfileForm.svelte'
	import MemberProfile from '$lib/member/MemberProfile.svelte'
	import { eventPath } from '$lib/store'
	import { slide } from 'svelte/transition'

	export let data

	let showLinks = false
</script>

{#if data.member?.isValidedByUser}
	<Profile user={data.user} />
	{#if data.member.event.memberFields.length}
		<MemberProfile
			fieldsValue={data.member.profile}
			event={data.member.event}
			on:success={() => (showLinks = true)}
		/>
	{:else}
		<Card class="max-w-2xl mx-auto">
			<span slot="title">Tu es membre de "{data.event.name}"</span>
		</Card>
	{/if}

	{#if showLinks}
		<div transition:slide>
			<Card bodyClass="grid grid-cols-3 gap-2">
				<a href={$eventPath} class="btn"> Vers la page d'accueil</a>
				<a href="{$eventPath}/teams" class="btn"> Voir les secteurs</a>
				<a href="{$eventPath}/me/subscribes" class="btn"> Voir tes inscriptions</a>
			</Card>
		</div>
	{/if}
{:else}
	<MemberForm event={data.event} userId={data.user.id} class="mx-auto" noCancelButton />
{/if}
