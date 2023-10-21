<script lang="ts">
	import {
		mdiCakeVariantOutline,
		mdiEmailCheckOutline,
		mdiEmailAlertOutline,
		mdiHomeCityOutline,
		mdiPhoneOutline,
	} from '@mdi/js'
	import { User } from '@prisma/client'
	import { Icon } from '$lib/material'
	import { getAge } from '$lib/utils'

	export let user: User
	let klass = ''
	export { klass as class }
</script>

<div
	class="grid grid-cols-1 sm:grid-cols-2 gap-2 gap-x-8 p-2 items-center text-xs font-medium text-base-content/70 {klass}"
>
	<div class="flex gap-4">
		{#if user.isEmailVerified}
			<Icon
				path={mdiEmailCheckOutline}
				class="opacity-70 fill-success"
				title="Email verfifié"
				size={18}
			/>
		{:else}
			<Icon
				path={mdiEmailAlertOutline}
				class="opacity-70 fill-error"
				title="Cette email n'a pas été verifié"
				size={18}
			/>
		{/if}
		<a href="mailto:{user.email}" class="link link-hover" target="_blank">
			{user.email}
		</a>
	</div>

	<div class="flex gap-4">
		<Icon path={mdiPhoneOutline} class="opacity-70" size={18} />
		<a href="tel:{user.phone}" class="link link-hover" target="_blank">
			{user.phone}
		</a>
	</div>

	<div class="flex gap-4">
		<Icon path={mdiCakeVariantOutline} class="opacity-70" size={18} />
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
		<Icon path={mdiHomeCityOutline} class="opacity-70" size={18} />
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
</div>
