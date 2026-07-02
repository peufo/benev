<script lang="ts">
	import { enhance } from '$app/forms'
	import { mdiCheck } from '@mdi/js'
	import { AlertCircle, Clock, HelpCircle, Send } from 'lucide-svelte'
	import { Card, Icon, InputText, InputTextarea, useForm } from 'fuma'

	const form = useForm({
		successMessage: 'Merci pour ton message',
	})
	export let data
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
				<h2 slot="title" class="text-xl font-bold text-primary">
					Nouvelle prise de contact avec benevio
				</h2>

				<form
					method="post"
					action="/contact?/new_message"
					use:enhance={form.submit}
					class="flex flex-col gap-4 mt-2"
				>
					<InputText key="subject" label="Sujet" />
					<InputTextarea key="content" label="Ton message" textarea={{ rows: 6 }} />

					<div class="flex justify-end">
						<button class="btn btn-primary gap-2">
							<Send size={18} />
							Envoyer
						</button>
					</div>
				</form>
			</Card>
		</div>

		<div class="lg:col-span-2 flex flex-col gap-6">
			<div class="bg-brand-beige/10 border border-brand-beige/20 rounded-2xl p-6">
				<div class="flex items-start gap-3">
					<AlertCircle size={22} class="text-primary shrink-0 mt-0.5" />
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
					<Clock size={20} class="shrink-0 mt-0.5" />
					<p class="text-sm leading-relaxed">
						Réponse sous quelques jours ouvrables, souvent plus vite.
					</p>
				</div>
				<div class="flex items-start gap-3">
					<HelpCircle size={20} class="shrink-0 mt-0.5" />
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
				{#each data.messages as message}
					<article
						class="border border-base-200 rounded-2xl p-5 bg-base-100 hover:border-brand-beige/40 transition-colors"
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
