<script lang="ts">
	import Profile from '$lib/me/ProfileForm.svelte'
	import MemberProfile from '$lib/member/MemberProfile.svelte'

	export let data
</script>

<Profile user={data.user} />

<MemberProfile fieldsValue={data.member.profile} event={data.member.event} />
