<script lang="ts">
	import { eventPath } from '$lib/store'
	import { ButtonDelete } from '$lib/fuma'
	import { useForm } from '$lib/fuma'
	import { enhance } from '$app/forms'

	interface Props {
		memberId: string
		redirectTo?: string
		class?: string
		btn?: boolean
		children?: import('svelte').Snippet
	}

	let { memberId, redirectTo = '/me', class: klass = '', btn = true, children }: Props = $props()

	const form = useForm({
		successMessage: 'Membre supprimé',
	})
</script>

<form method="post" class="contents" use:enhance={form.submit}>
	<input type="hidden" name="memberId" value={memberId} />
	<input type="hidden" name="redirectTo" value={redirectTo} />
	<ButtonDelete formaction="{$eventPath}/api/members?/delete_member" class={klass} {btn}>
		{#if children}{@render children()}{:else}Supprimer ma participation{/if}
	</ButtonDelete>
</form>
