<script lang="ts">
	import {
		mdiAlertOutline,
		mdiCheckCircleOutline,
		mdiDotsHorizontal,
		mdiTrashCanOutline,
	} from '@mdi/js'
	import { DropDown, Icon, ButtonDelete } from 'fuma'
	import { eventPath } from '$lib/store'
	import { useForm } from 'fuma/validation'
	import type { Subscribe } from '@prisma/client'
	import { enhance } from '$app/forms'

	export let subscribe: Subscribe

	let form = useForm()
</script>

<DropDown tippyProps={{ arrow: true }} wrapperClass="w-min">
	<button slot="activator" class=" relative z-10 btn btn-sm btn-square">
		<Icon path={mdiDotsHorizontal} size={20} class="opacity-70" />
	</button>

	<form
		use:enhance={form.submit}
		method="post"
		action="{$eventPath}/subscribes/{subscribe.id}?/subscribe_toggle_isAbsent"
	>
		{#if subscribe.isAbsent}
			<button class="menu-item">
				<Icon path={mdiCheckCircleOutline} class="fill-success" size={20} />
				<span>Marquer comme présent</span>
			</button>
		{:else}
			<button class="menu-item">
				<Icon path={mdiAlertOutline} class="fill-warning" size={20} />
				<span>Marquer comme absent</span>
			</button>
		{/if}

		<ButtonDelete
			btn={false}
			class="menu-item w-full"
			formaction="{$eventPath}/subscribes/{subscribe.id}?/subscribe_delete"
		>
			<svelte:fragment>
				<Icon path={mdiTrashCanOutline} class="fill-error/80" size={20} />
				<span>Supprimer</span>
			</svelte:fragment>

			<svelte:fragment slot="ready">
				<Icon path={mdiTrashCanOutline} class="fill-error/80" size={20} />
				<span>T'es sur ?</span>
			</svelte:fragment>
		</ButtonDelete>
	</form>
</DropDown>
