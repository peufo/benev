<script lang="ts">
	import {
		mdiAlertOutline,
		mdiCheckCircleOutline,
		mdiDotsHorizontal,
		mdiTrashCanOutline,
	} from '@mdi/js'
	import { Icon } from '$lib/fuma-legacy'
	import { DropDown } from 'fuma'
	import { ButtonDelete } from 'fuma'
	import { eventPath } from '$lib/store'
	import { useForm } from '$lib/fuma-legacy/validation'
	import type { Subscribe } from '@prisma/client'
	import { enhance } from '$app/forms'

	interface Props {
		subscribe: Subscribe
	}

	let { subscribe }: Props = $props()

	let form = useForm()
</script>

<DropDown tippyProps={{ arrow: true }} classWrapper="w-min">
	{#snippet activator()}
		<button class=" relative z-10 btn btn-sm btn-square">
			<Icon path={mdiDotsHorizontal} size={20} class="opacity-70" />
		</button>
	{/snippet}

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
			<Icon path={mdiTrashCanOutline} class="fill-error/80" size={20} />
			<span>Supprimer</span>

			{#snippet ready()}
				<Icon path={mdiTrashCanOutline} class="fill-error/80" size={20} />
				<span>T'es sur ?</span>
			{/snippet}
		</ButtonDelete>
	</form>
</DropDown>
