<script lang="ts">
	import type { User } from '@prisma/client'
	import SectionCollapse from '$lib/material/SectionCollapse.svelte'
	import AvatarForm from './AvatarForm.svelte'
	import ProfileForm from './ProfileForm.svelte'

	export let user: User
</script>

<SectionCollapse value="profile">
	<div slot="logo" class="m-2 py-0 md:py-6 md:ml-8 shrink-0">
		<AvatarForm {user} class="h-20 w-20 sm:h-28 sm:w-28" />
	</div>
	<svelte:fragment slot="title">
		<slot name="title">
			{user.firstName}
			{user.lastName}
		</slot>
	</svelte:fragment>

	<svelte:fragment slot="subtitle">
		<slot name="subtitle">
			<p>Profil général et préférences</p>
		</slot>
	</svelte:fragment>

	<slot>
		<ProfileForm {user} />
	</slot>
</SectionCollapse>
