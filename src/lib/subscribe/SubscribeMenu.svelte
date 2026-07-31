<script lang="ts">
	import { CircleCheckIcon, EllipsisIcon, Trash2Icon, TriangleAlertIcon } from '@lucide/svelte'
	import { ButtonDelete, DropDown } from 'fuma'
	import type { Subscribe } from '@prisma/client'
	import { deleteSubscribe, toggleSubscribeIsAbsent } from './subscribeState.remote'

	interface Props {
		subscribe: Subscribe
	}

	let { subscribe }: Props = $props()
</script>

<DropDown tippyProps={{ arrow: true }} classWrapper="w-min">
	{#snippet activator()}
		<button class=" relative z-10 btn btn-sm btn-square">
			<EllipsisIcon size={20} class="opacity-70" />
		</button>
	{/snippet}

	<!-- Les deux remote functions partagent le `<form>`: le `formaction` du bouton tranche. -->
	<form {...toggleSubscribeIsAbsent.for(subscribe.id)} {...deleteSubscribe.for(subscribe.id)}>
		<input type="hidden" name="subscribeId" value={subscribe.id} />

		{#if subscribe.isAbsent}
			<button formaction={toggleSubscribeIsAbsent.action} class="menu-item">
				<CircleCheckIcon class="text-success" size={20} />
				<span>Marquer comme présent</span>
			</button>
		{:else}
			<button formaction={toggleSubscribeIsAbsent.action} class="menu-item">
				<TriangleAlertIcon class="text-warning" size={20} />
				<span>Marquer comme absent</span>
			</button>
		{/if}

		<ButtonDelete btn={false} class="menu-item w-full" formaction={deleteSubscribe.action}>
			<Trash2Icon class="text-error/80" size={20} />
			<span>Supprimer</span>
		</ButtonDelete>
	</form>
</DropDown>
