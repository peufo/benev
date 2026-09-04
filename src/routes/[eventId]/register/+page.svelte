<script lang="ts">
	import { InviteMismatch, EmailVerificationRequired } from '$lib/me'
	import Register from './Register.svelte'

	let { data } = $props()
</script>

<!-- Le tunnel est remplacé, pas surmonté: ses étapes ne mènent nulle part pour ce compte. -->
{#if data.inviteMismatch}
	<InviteMismatch {...data.inviteMismatch} />
{:else if data.emailToVerify}
	<EmailVerificationRequired email={data.emailToVerify} />
{:else}
	<Register {...data} />
{/if}
