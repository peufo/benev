<script lang="ts">
	import { browser } from '$app/environment'
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form'
	import { InputText } from '$lib/material'
	import type EditorJS from '@editorjs/editorjs'

	import { onMount } from 'svelte'

	const form = useForm()
	let holder: HTMLElement
	let editor: EditorJS | undefined = undefined

	onMount(async () => {
		const [{ default: _EditorJS }, { tools }] = await Promise.all([
			import('@editorjs/editorjs'),
			import('./editorTools'),
		])
		editor = new _EditorJS({
			holder,
			tools,
			placeholder: 'Rédige ta page ici',
		})
	})
</script>

<form method="post" use:enhance={form.submit} class="flex flex-col gap-2">
	<InputText key="title" label="" input={{ placeholder: 'Titre de la page' }} class="max-w-xs" />

	<div class="input input-bordered w-[210mm] min-h-[555px] overflow-auto prose max-w-none">
		<div bind:this={holder} />
	</div>

  <div class="flex justify-end">
    <button class="btn">Valider</button>
  </div>

</form>
