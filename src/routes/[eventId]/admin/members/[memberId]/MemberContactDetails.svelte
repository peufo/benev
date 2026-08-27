<script lang="ts">
	import { tip } from 'fuma'
	import {
		Building2Icon,
		CakeIcon,
		MailCheckIcon,
		MailWarningIcon,
		PhoneIcon,
	} from '@lucide/svelte'
	import type { MemberWithComputedValues } from '$lib/server'
	import { getAge } from '$lib/utils'

	interface Props {
		member: MemberWithComputedValues
	}

	let { member }: Props = $props()

	const ADDRESS_PARTS = {
		street: 'Rue et numéro',
		zipCode: 'Code postal',
		city: 'Localité',
	} as const

	// Les clés vides *et* exigées par l'évènement: ce sont elles qui déclenchent le badge
	// « Incomplet », et donc les seules à porter le warning.
	const required = $derived(new Set(member.userProfileRequiredFields))

	const hasAddress = $derived(!!(member.street || member.zipCode || member.city))
	const addressMissing = $derived(
		Object.entries(ADDRESS_PARTS)
			.filter(([key]) => required.has(key))
			.map(([, label]) => label)
	)
</script>

{#snippet missingInfo(isRequired: boolean)}
	{#if isRequired}
		<span
			class="text-warning italic font-light"
			use:tip={{ content: "Information requise par l'évènement" }}
		>
			Info manquante
		</span>
	{:else}
		<span class="text-base-content/50">-</span>
	{/if}
{/snippet}

<div
	class="
		grid grid-cols-1 sm:grid-cols-2 gap-2 gap-x-8 pl-1.5 p-2 items-center
		text-base-content/70 text-sm md:text-base grow
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
			<span
				class="inline-flex"
				use:tip={{
					content: required.has('isEmailVerified')
						? "Validation de l'email requise par l'évènement"
						: "Cet email n'a pas été validé par le membre",
				}}
			>
				<MailWarningIcon class="opacity-70 text-warning" size={20} />
			</span>
		{/if}
		{#if member.email}
			<a href="mailto:{member.email}" class="link link-hover" target="_blank">
				{member.email}
			</a>
		{:else}
			<!-- L'email est toujours exigé: son absence garde l'erreur portée par l'icône. -->
			<span class="text-error">Info manquante</span>
		{/if}
	</div>

	<div class="flex gap-4 items-center">
		<PhoneIcon class={['opacity-70']} size={20} />
		{#if member.phone}
			<a href="tel:{member.phone}" class="link link-hover" target="_blank">
				{member.phone}
			</a>
		{:else}
			{@render missingInfo(required.has('phone'))}
		{/if}
	</div>

	<div class="flex gap-4 items-center">
		<CakeIcon class={['opacity-70']} size={20} />
		<div>
			{#if member.birthday}
				{member.birthday.toLocaleDateString()}
				({getAge(member.birthday)})
			{:else}
				{@render missingInfo(required.has('birthday'))}
			{/if}
		</div>
	</div>

	<div class="flex gap-4 items-center">
		{#if addressMissing.length}
			<span
				class="inline-flex"
				use:tip={{ content: `Requis par l'évènement: ${addressMissing.join(', ')}` }}
			>
				<Building2Icon class="opacity-70" size={20} />
			</span>
		{:else}
			<Building2Icon class="opacity-70" size={20} />
		{/if}
		{#if hasAddress}
			<a
				href="https://www.google.com/maps/search/{member.street} {member.zipCode} {member.city}"
				class="link link-hover"
				target="_blank"
			>
				{member.street || ''}<br />
				{member.zipCode || ''}
				{member.city || ''}
			</a>
		{:else}
			{@render missingInfo(!!addressMissing.length)}
		{/if}
	</div>
</div>
