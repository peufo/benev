<script lang="ts">
	import GithubIssues from '$lib/GithubIssues.svelte'

	export let data
</script>

<div class="max-w-3xl mx-auto flex flex-col gap-20 py-12 px-4">
	<!-- Hero -->
	<div class="text-center py-12 md:py-20">
		<h1 class="text-5xl md:text-7xl font-extrabold text-primary tracking-tight leading-none">
			Soutenir benevio
		</h1>
		<p class="mt-8 text-lg md:text-xl text-base-content/70 max-w-xl mx-auto leading-relaxed">
			Benevio est gratuit.<br />
			Pas de paywall, pas de pub, pas de revente de tes données.
		</p>
		<p class="mt-3 text-base text-base-content/60 max-w-xl mx-auto leading-relaxed">
			Le projet vit simplement grâce aux contributions volontaires. Si l'outil te simplifie la vie,
			tu peux aider, mais seulement si tu le veux.
		</p>
	</div>

	<!-- Comment soutenir -->
	<section class="flex flex-col gap-6">
		<h2 class="text-2xl font-bold text-primary">Comment soutenir ?</h2>

		<div class="grid gap-10 md:grid-cols-2 mt-2">
			<div>
				<h3 class="text-lg font-semibold">Faire un don</h3>
				<p class="mt-2 text-base-content/70 leading-relaxed">
					Un don ponctuel ou régulier permet de financer l'hébergement et le temps de développement.
				</p>
				<button class="btn btn-sm btn-outline mt-5" disabled> Bientôt disponible </button>
			</div>

			<div>
				<h3 class="text-lg font-semibold">Parler de benevio</h3>
				<p class="mt-2 text-base-content/70 leading-relaxed">
					Le bouche-à-oreille est notre meilleur vecteur de croissance. Partage l'outil avec ton
					réseau d'organisateurs.
				</p>
			</div>
		</div>
	</section>

	<!-- Comment participer -->
	<section
		class="flex flex-col gap-8 -mx-4 px-4 py-14 md:py-20 md:-mx-8 md:px-8 bg-brand-beige/10 rounded-2xl"
	>
		<h2 class="text-2xl font-bold text-primary">Comment participer ?</h2>

		<p class="text-base-content/70 leading-relaxed max-w-2xl">
			Le développement de benevio se passe sur
			<a
				href="https://github.com/peufo/benev"
				target="_blank"
				rel="noopener noreferrer"
				class="link link-primary">GitHub</a
			>. Chaque retour, bug ou idée est enregistré sous forme d'<em>issue</em> (un sujet de discussion).
			Tu n'as pas besoin d'être développeur pour participer.
		</p>

		<GithubIssues
			issues={data.recentIssues}
			title="{data.openCount} Sujet{data.openCount > 1 ? 's' : ''} ouvert{data.openCount > 1
				? 's'
				: ''}"
			titleHref="https://github.com/peufo/benev/issues"
			showNewIssueButton
		/>

		<GithubIssues
			issues={data.recentClosedIssues}
			title="{data.closedCount} Sujet{data.openCount > 1 ? 's' : ''} clôturé{data.closedCount > 1
				? 's'
				: ''}"
			titleHref="https://github.com/peufo/benev/issues?q=is%3Aissue+is%3Aclosed"
		/>
	</section>
</div>
