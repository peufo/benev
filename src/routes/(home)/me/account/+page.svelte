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

<hr />
<div class="flex gap-2 flex-wrap">
	<form method="POST" action="/me?/logout" class="contents">
		<button class="btn btn-sm btn-ghost">
			<Icon path={mdiLogout} size={20} class="opacity-70 rotate-180" />
			Déconnexion
		</button>
	</form>
	<DeleteUserForm />
</div>
