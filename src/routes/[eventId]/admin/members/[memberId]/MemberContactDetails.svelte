<script lang="ts">
	import { tip } from 'fuma'
	import {
		Building2Icon,
		CakeIcon,
		GhostIcon,
		MailCheckIcon,
		MailWarningIcon,
		PhoneIcon,
	} from '@lucide/svelte'
	import type { Member } from '@prisma/client'
	import { getAge } from '$lib/utils'

	interface Props {
		member: Member
	}

	let { member }: Props = $props()
</script>

<div
	class="
		grid grid-cols-1 sm:grid-cols-2 gap-2 gap-x-8 pl-1.5 p-2 items-center
		font-medium text-base-content/70 text-sm md:text-base grow
	"
>
	<div class="flex gap-4 items-center">
		{#if member.isEmailVerified}
			<span class="inline-flex" use:tip={{ content: 'Email validé par le membre' }}>
				<MailCheckIcon class="opacity-70 text-success" size={20} />
			</span>
		{:else if !member.email}
			<span class="inline-flex" use:tip={{ content: "Pas d'email" }}>
				<MailWarningIcon class="opacity-70 text-error" size={20} />
			</span>
		{:else}
			<span class="inline-flex" use:tip={{ content: "Cet email n'a pas été validé par le membre" }}>
				<MailWarningIcon class="opacity-70 text-warning" size={20} />
			</span>
		{/if}
		{#if member.email}
			<a href="mailto:{member.email}" class="link link-hover" target="_blank">
				{member.email}
			</a>
		{:else}
			<span>-</span>
		{/if}
	</div>

	<div class="flex gap-4 items-center">
		<PhoneIcon class="opacity-70" size={20} />
		{#if member.phone}
			<a href="tel:{member.phone}" class="link link-hover" target="_blank">
				{member.phone}
			</a>
		{:else}
			<span>-</span>
		{/if}
	</div>

	<div class="flex gap-4 items-center">
		<CakeIcon class="opacity-70" size={20} />
		<div>
			{#if member.birthday}
				{member.birthday.toLocaleDateString()}
				({getAge(member.birthday)})
			{:else}
				-
			{/if}
		</div>
	</div>

	<div class="flex gap-4 items-center">
		<Building2Icon class="opacity-70" size={20} />
		<a
			href="https://www.google.com/maps/search/{member.street} {member.zipCode} {member.city}"
			class="link link-hover"
			target="_blank"
		>
			{member.street || '-'}<br />
			{member.zipCode || ''}
			{member.city || ''}
		</a>
	</div>
</div>
