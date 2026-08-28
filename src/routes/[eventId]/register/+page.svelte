<script lang="ts">
	import { InviteMismatch } from '$lib/me'
	import Register from './Register.svelte'

	let { data } = $props()
</script>

<!-- Le tunnel est remplacé, pas surmonté: ses étapes ne mènent nulle part pour ce compte. -->
{#if data.inviteMismatch}
	<InviteMismatch {...data.inviteMismatch} />
{:else}
	<Register {...data} />
{/if}
