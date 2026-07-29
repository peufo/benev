<script lang="ts">
	import { mdiCheck } from '@mdi/js'
	import { CircleAlertIcon, ClockIcon, CircleQuestionMarkIcon, SendIcon } from '@lucide/svelte'
	import { Card, Icon } from '$lib/fuma-legacy'
	import { InputString, InputTextarea } from 'fuma'
	import { toast } from 'svelte-sonner'
	import { sendMessage } from './contact.remote'
	import { isHttpError } from '@sveltejs/kit'

	let { data } = $props()

	let isSubmitting = $state(false)
</script>

<div class="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20">
	<!-- Hero -->
	<section class="max-w-2xl mb-12 md:mb-16">
		<h1
			class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary tracking-tight leading-[1.05]"
		>
			Une question ?
		</h1>
		<p class="mt-5 text-lg md:text-xl text-base-content/70 leading-relaxed">
			Écris-nous directement. On lit chaque message et on te répond dès que possible.
		</p>
	</section>

	<!-- Formulaire + contexte -->
	<div class="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
		<div class="lg:col-span-3">
			<Card>
				{#snippet title()}
					<h2 class="text-xl font-bold text-primary">Nouvelle prise de contact avec benevio</h2>
				{/snippet}

				<form
					{...sendMessage.enhance(async ({ submit, fields }) => {
						isSubmitting = true
						const id = toast.loading('Envoie...')
						try {
							if (await submit()) {
								toast.success('Merci pour ton message', { id })
								fields.set({})
							} else {
								toast.warning('Formulaire incorrect', { id })
							}
						} catch (err) {
							if (isHttpError(err)) toast.error(err.body.message, { id })
							console.error(err)
							toast.error('Une erreur est survenue', { id })
						} finally {
							isSubmitting = false
						}
					})}
					class="flex flex-col gap-4 mt-2"
				>
					<InputString
						field={sendMessage.fields.subject}
						label="Sujet"
						variant="block"
						class="w-full"
					/>
					<InputTextarea
						field={sendMessage.fields.content}
						label="Ton message"
						rows={6}
						variant="block"
						class="w-full"
					/>

					<div class="flex justify-end">
						<button class="btn btn-primary gap-2" disabled={isSubmitting}>
							<SendIcon size={18} />
							Envoyer
						</button>
					</div>
				</form>
			</Card>
		</div>

		<div class="lg:col-span-2 flex flex-col gap-6">
			<div class="bg-secondary/10 border border-soft rounded-2xl p-6">
				<div class="flex items-start gap-3">
					<CircleAlertIcon size={22} class="text-primary shrink-0 mt-0.5" />
					<div>
						<h3 class="font-semibold text-primary">Tu n'organises pas d'événement ?</h3>
						<p class="text-sm text-base-content/80 mt-1 leading-relaxed">
							Si tu souhaites contacter les responsables d'un événement,
							<a href="/events" class="link link-primary">rends-toi dans son espace dédié</a>. Les
							moyens de contact se trouvent généralement en pied de page.
						</p>
					</div>
				</div>
			</div>

			<div class="flex flex-col gap-4 text-base-content/80 px-1">
				<div class="flex items-start gap-3">
					<ClockIcon size={20} class="shrink-0 mt-0.5" />
					<p class="text-sm leading-relaxed">
						Réponse sous quelques jours ouvrables, souvent plus vite.
					</p>
				</div>
				<div class="flex items-start gap-3">
					<CircleQuestionMarkIcon size={20} class="shrink-0 mt-0.5" />
					<p class="text-sm leading-relaxed">
						Plus ton message est détaillé, plus notre réponse sera utile.
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Messages -->
	{#if data.messages.length}
		<section class="mt-16 md:mt-24">
			<h2 class="text-2xl md:text-3xl font-bold text-primary tracking-tight mb-6">Mes demandes</h2>
			<div class="grid md:grid-cols-2 gap-4">
				{#each data.messages as message (message.id)}
					<article
						class="border border-soft rounded-2xl p-5 bg-base-100 hover:border-secondary/40 transition-colors"
					>
						<div class="flex gap-3 items-start">
							<div class="grow">
								<h3 class="font-semibold text-primary">{message.subject}</h3>
								<time class="text-xs text-base-content/60 block mt-1">
									Envoyé le {message.createdAt.toLocaleDateString()}
								</time>
							</div>

							{#if message.state === 'waitOnAgent' || message.state === 'waitOnAuthor'}
								<div class="badge badge-warning badge-outline whitespace-nowrap">En traitement</div>
							{:else if message.state === 'done'}
								<div class="badge badge-success badge-outline whitespace-nowrap">
									<Icon path={mdiCheck} class="fill-success -translate-x-1" size={16} />
									Terminé
								</div>
							{/if}
						</div>
						<p class="text-sm text-base-content/80 mt-4 leading-relaxed">{message.content}</p>
					</article>
				{/each}
			</div>
		</section>
	{/if}
</div>
