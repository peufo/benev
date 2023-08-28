<script lang="ts">
	import Profile from '$lib/me/ProfileForm.svelte'
	import MemberProfile from '$lib/member/MemberProfile.svelte'

	export let data
</script>

<Profile user={data.user} />

{#each data.user.members as member (member.id)}
	<MemberProfile event={member.event} fieldsValue={member.profile} />
{/each}
