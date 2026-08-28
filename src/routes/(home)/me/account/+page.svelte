<script lang="ts">
	import { AccountForm, AvatarForm, DeleteUserForm } from '$lib/me'
	import { logoutUser } from '$lib/me/user.remote'

	let { data } = $props()
</script>

<header class="flex items-center gap-4 sm:gap-6">
	<AvatarForm user={data.user} class="h-20 w-20 sm:h-24 sm:w-24" />
	<div class="min-w-0">
		<h1 class="truncate text-xl font-semibold">
			{data.user.firstName}
			{data.user.lastName}
		</h1>
		<p class="truncate text-sm text-base-content/70">{data.user.email}</p>
		<p class="mt-2 max-w-md text-xs text-base-content/70">
			Tes informations personnelles sont uniquement partagées avec les responsables des évènements
			auquels tu participes.
		</p>
	</div>
</header>

<div class="mt-6">
	<AccountForm user={data.user} />
</div>

<hr class="my-6 border-soft" />
<div class="flex flex-wrap justify-between gap-2">
	<DeleteUserForm ownedEventsCount={data.ownedEventsCount} />
	<form {...logoutUser} class="contents">
		<button class="btn btn-ghost btn-sm"> Déconnexion </button>
	</form>
</div>
