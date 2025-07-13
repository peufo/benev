<script lang="ts">
	import {
		mdiCakeVariantOutline,
		mdiEmailCheckOutline,
		mdiEmailAlertOutline,
		mdiHomeCityOutline,
		mdiPhoneOutline,
		mdiGhostOutline,
	} from '@mdi/js'
	import type { Member } from '@prisma/client'
	import { Icon } from 'fuma'
	import { getAge } from '$lib/utils'

	export let member: Member
	let klass = ''
	export { klass as class }
</script>

<div
	class="
		grid grid-cols-1 sm:grid-cols-2 gap-2 gap-x-8 pl-0 p-2 items-center
		font-medium text-base-content/70 text-sm md:text-base {klass}
	"
>
	<div class="flex gap-4">
		{#if !member.email}
			<Icon path={mdiGhostOutline} class="opacity-70" size={20} />
			<span>Pas d'email</span>
		{:else}
			{#if member.isEmailVerified}
				<Icon
					path={mdiEmailCheckOutline}
					class="opacity-70 fill-success"
					title="Email validé par le membre"
					size={20}
				/>
			{:else}
				<Icon
					path={mdiEmailAlertOutline}
					class="opacity-70 fill-error"
					title="Cet email n'a pas été validé par le membre"
					size={20}
				/>
			{/if}
			<a href="mailto:{member.email}" class="link link-hover" target="_blank">
				{member.email}
			</a>
		{/if}
	</div>

	<div class="flex gap-4">
		<Icon path={mdiPhoneOutline} class="opacity-70" size={20} />
		{#if member.phone}
			<a href="tel:{member.phone}" class="link link-hover" target="_blank">
				{member.phone}
			</a>
		{:else}
			<span>-</span>
		{/if}
	</div>

	<div class="flex gap-4">
		<Icon path={mdiCakeVariantOutline} class="opacity-70" size={20} />
		<div>
			{#if member.birthday}
				{member.birthday.toLocaleDateString()}
				({getAge(member.birthday)})
			{:else}
				-
			{/if}
		</div>
	</div>

	<div class="flex gap-4">
		<Icon path={mdiHomeCityOutline} class="opacity-70" size={20} />
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
