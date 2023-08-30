<script lang="ts">
	import EmailNewMember from '$lib/email/EmailNewMember.svelte'
	import EmailNewMemberNotification from '$lib/email/EmailNewMemberNotification.svelte'

	export let data
</script>

<EmailNewMember {...data} />

<EmailNewMemberNotification {...data} />
