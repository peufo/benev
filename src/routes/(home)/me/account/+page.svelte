<script lang="ts">
	import { mdiLogout } from '@mdi/js'
	import { Icon } from '$lib/material'
	import { ProfileForm, AvatarForm, DeleteUserForm } from '$lib/me'

	export let data
</script>

<div class="flex justify-between">
	<div>
		<div class="title mt-2">Mon compte</div>
		<p class="text-xs opacity-70 mt-3 max-w-sm">
			Tes informations personnelles sont uniquement partagées avec les responsables des évènements
			auquels tu participes.
		</p>
	</div>
	<AvatarForm user={data.user} class="h-20 w-20 sm:h-28 sm:w-28 ml-auto" />
</div>
<ProfileForm user={data.user} />

<hr class="my-3" />
<div class="flex gap-2 flex-wrap justify-end">
	<DeleteUserForm />
	<form method="POST" action="/me?/logout" class="contents">
		<button class="btn btn-sm btn-ghost"> Déconnexion </button>
	</form>
</div>
