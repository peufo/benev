<script lang="ts">
	import { Icon } from '$lib/material'
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
	import { getAge } from '$lib/utils'
	import { userSizeLabel } from '$lib/form'

	export let user: User
</script>

<div class="card shadow-lg bordered bg-base-200">
	<div class="card-body">
		<div class="card-title gap-4 text-2xl mb-6">
			<Icon path={mdiAccountOutline} class="scale-150" />
			{user.firstName}
			{user.lastName}
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
			<div class="flex gap-4">
				<Icon path={mdiHomeCityOutline} />
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
				<Icon path={mdiCakeVariantOutline} />
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
				<Icon path={mdiEmailOutline} />
				<a href="mailto:{user.email}" class="link link-hover" target="_blank">
					{user.email}
				</a>
			</div>

			<div class="flex gap-4">
				<Icon path={mdiPhoneOutline} />
				<a href="tel:{user.phone}" class="link link-hover" target="_blank">
					{user.phone}
				</a>
			</div>

			<div class="flex gap-4">
				{#if user.isInsured}
					<Icon path={mdiShieldCheckOutline} class="fill-success" />
					<div>Assurance accident</div>
				{:else}
					<Icon path={mdiShieldAlertOutline} class="fill-error" />
					<div>Pas d'assurance accident</div>
				{/if}
			</div>

			<div class="flex gap-4">
				<Icon path={mdiTshirtCrewOutline} />
				<div>
					{user.size ? userSizeLabel[user.size] : '-'}
				</div>
			</div>

			<div class="flex gap-4">
				<Icon path={mdiFoodOutline} />
				<div>
					{user.diet?.replaceAll(/[\[\]"]/g, '').replaceAll(',', ', ') || '-'}
				</div>
			</div>

			<div class="flex gap-4">
				<Icon path={mdiHammerWrench} />
				<div>
					{user.skillString || '-'}
				</div>
			</div>

			<div class="flex gap-4 sm:col-span-2">
				<Icon path={mdiCommentOutline} class="shrink-0" />
				<div>
					{user.comment || '-'}
				</div>
			</div>
		</div>
	</div>
</div>
