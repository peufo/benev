<script lang="ts">
	import {
		mdiAccountOutline,
		mdiCakeVariantOutline,
		mdiCommentOutline,
		mdiEmailOutline,
		mdiFoodOutline,
		mdiHammerWrench,
		mdiHomeCityOutline,
		mdiPhoneOutline,
		mdiShieldAlertOutline,
		mdiShieldCheckOutline,
		mdiTshirtCrewOutline,
	} from '@mdi/js'
	import { User } from '@prisma/client'
	import { Card, Icon } from '$lib/material'
	import { getAge } from '$lib/utils'
	import { userSizeLabel } from '$lib/form'
	import { eventPath } from '$lib/store'

	export let user: User
</script>

<Card returnUrl="{$eventPath}/admin">
	<span slot="title">{user.firstName} {user.lastName}</span>

	<div class="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
		<div class="flex gap-4">
			<Icon path={mdiHomeCityOutline} class="opacity-70" />
			<a
				href="https://www.google.com/maps/search/{user.street} {user.zipCode} {user.city}"
				class="link link-hover"
				target="_blank"
			>
				{user.street || '-'}<br />
				{user.zipCode || ''}
				{user.city || ''}
			</a>
		</div>

		<div class="flex gap-4">
			<Icon path={mdiCakeVariantOutline} class="opacity-70" />
			<div>
				{#if user.birthday}
					{user.birthday.toLocaleDateString()}
					({getAge(user.birthday)})
				{:else}
					-
				{/if}
			</div>
		</div>

		<div class="flex gap-4">
			<Icon path={mdiEmailOutline} class="opacity-70" />
			<a href="mailto:{user.email}" class="link link-hover" target="_blank">
				{user.email}
			</a>
		</div>

		<div class="flex gap-4">
			<Icon path={mdiPhoneOutline} class="opacity-70" />
			<a href="tel:{user.phone}" class="link link-hover" target="_blank">
				{user.phone}
			</a>
		</div>

		<div class="flex gap-4">
			{#if user.isInsured}
				<Icon path={mdiShieldCheckOutline} class="fill-success opacity-70" />
				<div>Assurance accident</div>
			{:else}
				<Icon path={mdiShieldAlertOutline} class="fill-error opacity-70" />
				<div>Pas d'assurance accident</div>
			{/if}
		</div>

		<div class="flex gap-4">
			<Icon path={mdiTshirtCrewOutline} class="opacity-70" />
			<div>
				{user.size ? userSizeLabel[user.size] : '-'}
			</div>
		</div>

		<div class="flex gap-4">
			<Icon path={mdiFoodOutline} class="opacity-70" />
			<div>
				{user.diet?.replaceAll(/[\[\]"]/g, '').replaceAll(',', ', ') || '-'}
			</div>
		</div>

		<div class="flex gap-4">
			<Icon path={mdiHammerWrench} class="opacity-70" />
			<div>
				{user.skillString || '-'}
			</div>
		</div>

		<div class="flex gap-4 sm:col-span-2">
			<Icon path={mdiCommentOutline} class="shrink-0 opacity-70" />
			<div>
				{user.comment || '-'}
			</div>
		</div>
	</div>
</Card>
