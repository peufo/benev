<script lang="ts">
	import type { Snippet } from 'svelte'
	import { ButtonDelete } from 'fuma'
	import { enhanceForm } from '$lib/enhanceForm'
	import { deleteMember } from './member.remote'

	interface Props {
		memberId: string
		redirectTo?: string
		class?: string
		btn?: boolean
		children?: Snippet<[{ waitConfirmation: boolean }]>
	}

	let {
		memberId,
		redirectTo = '/me',
		class: klass = '',
		btn = true,
		children: label,
	}: Props = $props()

	const uid = $props.id()
	const remoteForm = deleteMember.for(uid)
</script>

<form {...remoteForm.enhance(enhanceForm())} class="contents">
	<input type="hidden" name="memberId" value={memberId} />
	<input type="hidden" name="redirectTo" value={redirectTo} />
	<ButtonDelete formaction={remoteForm.action} class={klass} {btn}>
		{#snippet children(state)}
			{#if label}
				{@render label(state)}
			{:else}
				Supprimer ma participation
			{/if}
		{/snippet}
	</ButtonDelete>
</form>
