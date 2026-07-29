<script lang="ts">
	import { ButtonDelete } from 'fuma'
	import { deleteMember } from './member.remote'

	interface Props {
		memberId: string
		redirectTo?: string
		class?: string
		btn?: boolean
		children?: import('svelte').Snippet
	}

	let { memberId, redirectTo = '/me', class: klass = '', btn = true, children }: Props = $props()
</script>

<form {...deleteMember.for(memberId)} class="contents">
	<input type="hidden" name="memberId" value={memberId} />
	<input type="hidden" name="redirectTo" value={redirectTo} />
	<ButtonDelete formaction={deleteMember.action} class={klass} {btn}>
		{#if children}{@render children()}{:else}Supprimer ma participation{/if}
	</ButtonDelete>
</form>
