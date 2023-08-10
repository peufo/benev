<script lang="ts">
	import Profile from './Profile.svelte'

	export let data
</script>

<Profile user={data.user} />
