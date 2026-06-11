<script lang="ts">
	import GithubIssues from '$lib/GithubIssues.svelte'
	import { Code, GitBranch, ArrowRight } from 'lucide-svelte'

	export let data

	$: openCount = data.openCount || data.recentIssues.length
	$: closedCount = data.closedCount || data.recentClosedIssues.length
</script>

<div class="max-w-5xl mx-auto flex flex-col gap-24 py-12 px-4 md:px-8">
	<!-- Hero -->
	<section>
		<div class="flex flex-col lg:flex-row lg:items-end gap-10 lg:gap-16 py-8 md:py-16">
			<div class="max-w-2xl">
				<h1
					class="text-4xl md:text-6xl lg:text-7xl font-extrabold text-primary tracking-tight leading-[0.95]"
				>
					Le code est libre.
					<span class="block mt-2 text-base-content/70">L'hébergement est un service.</span>
				</h1>
				<p class="mt-6 md:mt-8 text-lg md:text-xl text-base-content/70 leading-relaxed max-w-xl">
					benevio est un logiciel open source sous licence AGPL-3.0. Tu peux l'utiliser, le modifier
					et le redistribuer librement. L'hébergement clé en main sur benev.io est payant, car les
					serveurs et le support on un coût réel.
				</p>
				<div class="mt-8 flex flex-col sm:flex-row gap-4">
					<a
						href="/me/events?new-event"
						class="btn btn-primary btn-lg
							shadow-lg hover:shadow-xl hover:shadow-primary/20
							transition-all duration-200 ease-out"
					>
						<span class="font-semibold">Créer mon événement</span>
						<ArrowRight size={18} />
					</a>
					<a
						href="https://github.com/peufo/benev"
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-outline btn-lg"
					>
						<Code size={18} />
						<span>Voir le code</span>
					</a>
				</div>
			</div>

			<div class="hidden lg:block shrink-0">
				<div class="bg-base-200 rounded-2xl p-6 font-mono text-sm shadow-inner w-80">
					<div class="flex gap-2 mb-4">
						<div class="w-3 h-3 rounded-full bg-red-400" />
						<div class="w-3 h-3 rounded-full bg-yellow-400" />
						<div class="w-3 h-3 rounded-full bg-green-400" />
					</div>
					<p class="text-base-content/50"># benevio est open source</p>
					<p class="text-base-content/50"># sous licence AGPL-3.0</p>
					<p class="text-primary font-semibold mt-3">git clone https://github.com/peufo/benev</p>
				</div>
			</div>
		</div>

		<p class="text-base-content/70 leading-relaxed max-w-2xl">
			Si les limites de l'hébergement officiel te posent problème, tu peux
			<a
				href="https://github.com/peufo/benev"
				target="_blank"
				rel="noopener noreferrer"
				class="link link-primary"
			>
				héberger benevio
			</a>
			sur ton propre serveur. C'est la même application, mais sur ton infrastructure.
		</p>
	</section>

	<!-- Contribuer -->
	<section class="flex flex-col gap-8">
		<div class="flex items-start gap-5">
			<div class="bg-base-100 rounded-xl p-3 shadow-sm border border-base-200 shrink-0">
				<GitBranch size={28} class="text-primary" />
			</div>
			<div>
				<h2 class="text-2xl md:text-3xl font-bold text-primary">
					Contribuer, même sans être développeur
				</h2>
				<p class="mt-3 text-base-content/70 leading-relaxed max-w-2xl">
					Le développement se passe sur
					<a
						href="https://github.com/peufo/benev"
						target="_blank"
						rel="noopener noreferrer"
						class="link link-primary"
					>
						GitHub
					</a>. Chaque retour, idée ou bug reporté sous forme d'<em>issue</em> fait avancer le projet.
					Tu n'as pas besoin de savoir coder pour participer.
				</p>
			</div>
		</div>

		<div class="pl-0 md:pl-[68px]">
			{#if data.recentIssues.length > 0}
				<GithubIssues
					issues={data.recentIssues}
					title="{openCount} sujet{openCount > 1 ? 's' : ''} ouvert{openCount > 1 ? 's' : ''}"
					titleHref="https://github.com/peufo/benev/issues"
					showNewIssueButton
				/>
			{:else}
				<div class="bg-base-200/40 rounded-xl p-8 text-center">
					<p class="text-base-content/60">
						Aucun sujet ouvert pour le moment. Sois le premier à en créer un sur
						<a
							href="https://github.com/peufo/benev/issues/new"
							target="_blank"
							rel="noopener noreferrer"
							class="link link-primary"
						>
							GitHub
						</a>.
					</p>
				</div>
			{/if}
		</div>

		{#if data.recentClosedIssues.length > 0}
			<div class="pl-0 md:pl-[68px]">
				<GithubIssues
					issues={data.recentClosedIssues}
					title="{closedCount} sujet{closedCount > 1 ? 's' : ''} clôturé{closedCount > 1
						? 's'
						: ''}"
					titleHref="https://github.com/peufo/benev/issues?q=is%3Aissue+is%3Aclosed"
				/>
			</div>
		{/if}
	</section>

	<!-- CTA final -->
	<section class="text-center py-12">
		<h2 class="text-3xl md:text-4xl font-bold text-primary">Prêt à organiser ton événement ?</h2>
		<p class="mt-4 text-lg text-base-content/70 max-w-xl mx-auto leading-relaxed">
			Crée gratuitement ton premier événement et découvre à quel point la gestion de bénévoles peut
			être simple.
		</p>
		<a
			href="/me/events"
			class="btn btn-primary btn-lg mt-8
				shadow-lg hover:shadow-xl hover:shadow-primary/20
				transition-all duration-200 ease-out"
		>
			<span class="font-semibold">Créer mon événement</span>
			<ArrowRight size={18} />
		</a>
	</section>
</div>
