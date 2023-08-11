<script lang="ts">
	import Profile from '$lib/me/ProfileForm.svelte'

	export let data
</script>

<Profile user={data.user} />
