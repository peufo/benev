<script lang="ts">
	import { CopyPlusIcon } from '@lucide/svelte'
	import type { Team } from '@prisma/client'
	import { enhanceForm } from '$lib/enhanceForm'
	import { cloneTeamForm } from './team.remote'

	interface Props {
		team: { id: string }
		oncloned?: (clone: Team) => void
	}

	let { team, oncloned }: Props = $props()

	const remoteForm = $derived(cloneTeamForm.for(team.id))
</script>

<form
	{...remoteForm.enhance(
		enhanceForm({
			success: 'Secteur dupliqué',
			onsuccess: () => {
				const clone = remoteForm.result
				if (clone) oncloned?.(clone)
			},
		})
	)}
	class="contents"
>
	<input type="hidden" name="id" value={team.id} />
	<button type="submit" class="btn btn-sm btn-primary btn-soft">
		<CopyPlusIcon size={20} />
		<span>Dupliquer</span>
	</button>
</form>
