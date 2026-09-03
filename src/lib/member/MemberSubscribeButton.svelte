<script lang="ts">
	import { ClipboardListIcon } from '@lucide/svelte'
	import { tip } from 'fuma'
	import type { Member } from '@prisma/client'

	interface Props {
		member: Member
		onclick: () => void
	}

	let { member, onclick }: Props = $props()
</script>

<button
	type="button"
	class="btn btn-square btn-sm btn-secondary btn-soft"
	{onclick}
	use:tip={{ content: `Inscrire ${member.firstName} à un secteur` }}
>
	<ClipboardListIcon size={20} />
</button>
