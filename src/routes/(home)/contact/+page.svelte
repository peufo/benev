<script lang="ts">
	import { enhance } from '$app/forms'
	import { Card, Icon, InputText, Placeholder } from 'fuma'
	import InputTextarea from '$lib/material/input/InputTextarea.svelte'
	import { useForm } from '$lib/validation'
	import { mdiCheck } from '@mdi/js'

	const form = useForm({
		successMessage: 'Merci pour ton message',
	})
	export let data
</script>

<div class="max-w-xl mx-auto flex flex-col gap-4">
	<Card>
		<h2 slot="title">Nouvelle prise de contact</h2>
		<form
			method="post"
			action="/contact?/new_message"
			use:enhance={form.submit}
			class="flex flex-col gap-2"
		>
			<InputText key="subject" label="Sujet" />
			<InputTextarea key="content" label="Ton message" />

			<div class="flex justify-end">
				<button class="btn"> Envoyer </button>
			</div>
		</form>
	</Card>
	{#if data.messages.length}
		<Card>
			<h2 slot="title">Mes demandes</h2>
			<div class="flex flex-col gap-2 mt-4">
				{#each data.messages as message}
					<section class="border rounded p-4 pt-2">
						<div class="flex gap-2 items-top">
							<div class="flex flex-wrap gap-x-2 gap-y-0 items-center">
								<h3 class="font-semibold opacity-80">{message.subject}</h3>
								<span class="text-xs italic opacity-70">
									Envoyer le {message.createdAt.toLocaleDateString()}
								</span>
							</div>

							{#if message.state === 'waitOnAgent' || message.state === 'waitOnAuthor'}
								<div class="badge badge-warning badge-outline ml-auto whitespace-nowrap mt-1">
									En traitement
								</div>
							{:else if message.state === 'done'}
								<div class="badge badge-success badge-outline ml-auto whitespace-nowrap mt-1">
									<Icon path={mdiCheck} class="fill-success -translate-x-1" size={18} />
									Terminé
								</div>
							{/if}
						</div>
						<p class="text-sm opacity-90 mt-2">{message.content}</p>
					</section>
				{/each}
			</div>
		</Card>
	{/if}
</div>
