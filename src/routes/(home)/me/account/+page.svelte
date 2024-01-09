<script lang="ts">
	import { ProfileForm, AvatarForm, DeleteUserForm } from '$lib/me'

	export let data
</script>

<div class="flex justify-between gap-4">
	<div class="shrink">
		<div class="title mt-2">Mon compte</div>
		<p class="text-xs opacity-70 mt-3 max-w-sm">
			Tes informations personnelles sont uniquement partagées avec les responsables des évènements
			auquels tu participes.
		</p>
	</div>
	<div class="shrink-0">
		<AvatarForm user={data.user} />
	</div>
</div>
<ProfileForm user={data.user} />

<hr class="my-3" />
<div class="flex gap-2 flex-wrap justify-end">
	<DeleteUserForm />
	<form method="POST" action="/me?/logout" class="contents">
		<button class="btn btn-sm btn-ghost"> Déconnexion </button>
	</form>
</div>
