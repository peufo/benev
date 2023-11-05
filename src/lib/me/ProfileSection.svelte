<script lang="ts">
	import type { User } from '@prisma/client'
	import SectionCollapse from '$lib/material/SectionCollapse.svelte'
	import AvatarForm from './AvatarForm.svelte'
	import ProfileForm from './ProfileForm.svelte'

	export let user: User
</script>

<SectionCollapse value="profile">
	<div slot="logo" class="m-2 py-0 md:py-6 md:ml-8 shrink-0">
		<AvatarForm {user} />
	</div>

	<div slot="title">
		<slot name="title">
			{user.firstName}
			{user.lastName}
		</slot>
	</div>
	<div slot="subtitle">
		<slot name="subtitle">
			<p>Profil et préférences commune à tous les événements.</p>
		</slot>
	</div>

	<slot>
		<ProfileForm {user} />
	</slot>
</SectionCollapse>
