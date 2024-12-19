<script lang="ts">
	import {
		mdiCakeVariantOutline,
		mdiEmailCheckOutline,
		mdiEmailAlertOutline,
		mdiHomeCityOutline,
		mdiPhoneOutline,
	} from '@mdi/js'
	import type { User } from '@prisma/client'
	import { Icon } from 'fuma'
	import { getAge } from '$lib/utils'

	export let user: User
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
		{#if user.isEmailVerified}
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
		<a href="mailto:{user.email}" class="link link-hover" target="_blank">
			{user.email}
		</a>
	</div>

	<div class="flex gap-4">
		<Icon path={mdiPhoneOutline} class="opacity-70" size={20} />
		{#if user.phone}
			<a href="tel:{user.phone}" class="link link-hover" target="_blank">
				{user.phone}
			</a>
		{:else}
			<span>-</span>
		{/if}
	</div>

	<div class="flex gap-4">
		<Icon path={mdiCakeVariantOutline} class="opacity-70" size={20} />
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
		<Icon path={mdiHomeCityOutline} class="opacity-70" size={20} />
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
