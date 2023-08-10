<script lang="ts">
	import Profile from '$lib/auth/ProfileForm.svelte'

	export let data
</script>

<Profile user={data.user} />
