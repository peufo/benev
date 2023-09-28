<script lang="ts">
	import {
		mdiCakeVariantOutline,
		mdiEmailCheckOutline,
		mdiEmailAlertOutline,
		mdiHomeCityOutline,
		mdiPhoneOutline,
	} from '@mdi/js'
	import { User } from '@prisma/client'
	import { Card, Icon } from '$lib/material'
	import { getAge } from '$lib/utils'
	import { eventPath } from '$lib/store'

	export let user: User
</script>

<Card returnUrl="{$eventPath}/admin/manage/members">
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
			{#if user.isEmailVerified}
				<Icon path={mdiEmailCheckOutline} class="opacity-70 fill-success" title="Email verfifié" />
			{:else}
				<Icon
					path={mdiEmailAlertOutline}
					class="opacity-70 fill-error"
					title="Cette email n'a pas été verifié"
				/>
			{/if}
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
	</div>

	<slot />
</Card>
