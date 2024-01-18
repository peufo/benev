<script lang="ts">
	import { mdiChevronDown, mdiContentSaveOutline } from '@mdi/js'
	import type { View } from '@prisma/client'
	import { Dialog, DropDown, Icon, InputText } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'
	import { useForm } from '$lib/validation'
	import { enhance } from '$app/forms'
	import { slide } from 'svelte/transition'

	export let key: string
	export let views: View[]

	let dialog: HTMLDialogElement
	const form = useForm({
		successCallback() {
			dialog.close()
		},
	})
</script>

<DropDown>
	<button
		type="button"
		slot="activator"
		class="menu-item btn-sm border bordered font-semibold opacity-90 gap-1 rounded-lg"
	>
		<span>Vue standard</span>
		<Icon path={mdiChevronDown} size={20} class="opacity-90 translate-x-1 translate-y-[1px]" />
	</button>

	<ul>
		{#each views as view}
			<li>
				<a href="{$page.url.pathname}{view.query}" class="menu-item">
					{view.name}
				</a>
			</li>
		{/each}
	</ul>
</DropDown>

{#if $page.url.search}
	<button
		transition:slide={{ axis: 'x', duration: 200 }}
		type="button"
		class="btn btn-square btn-sm"
		on:click={() => dialog.showModal()}
	>
		<Icon path={mdiContentSaveOutline} size={21} class="opacity-75" title="Sauvegarder cette vue" />
	</button>
{/if}

<Dialog bind:dialog>
	<h2 slot="header" class="title">Sauvegarder cette vue</h2>

	<form action="{$eventPath}/admin?/create_view" method="post" use:enhance={form.submit}>
		<input type="hidden" name="key" value={key} />
		<input type="hidden" name="query" value={$page.url.search} />
		<InputText key="name" input={{ placeholder: 'Nom de la vue' }} />

		<div class="flex justify-end mt-2">
			<button class="btn"> Valider </button>
		</div>
	</form>
</Dialog>
