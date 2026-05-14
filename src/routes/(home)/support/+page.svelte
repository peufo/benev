<script lang="ts">
	import {
		Heart,
		Bug,
		Code2,
		Share2,
		MessageCircleQuestionMark,
		Braces,
		GitPullRequestArrow,
		Megaphone,
	} from 'lucide-svelte'
</script>

<div class="max-w-3xl mx-auto flex flex-col gap-12 py-12 px-4">
	<!-- Hero -->
	<div class="text-center">
		<h1 class="text-4xl md:text-5xl font-bold text-primary">Soutenir benevio</h1>
		<p class="mt-6 text-lg text-base-content/80 max-w-2xl mx-auto leading-relaxed">
			Benevio est gratuit. <br />
			Pas de paywall, pas de pub, pas de revente de tes données. <br />
			Le projet vit simplement grâce aux contributions volontaires. Donc si l'outil te simplifie la vie,
			tu peux aider — mais seulement si tu le veux.
		</p>
	</div>

	<!-- Comment soutenir -->
	<section class="flex flex-col gap-6">
		<h2 class="text-2xl font-bold text-primary">Comment soutenir ?</h2>

		<div class="grid gap-6 md:grid-cols-2">
			<div class="card bg-base-100 border border-base-200 p-6">
				<div class="flex items-center gap-3 my-2">
					<Heart size={32} class="text-primary" />
					<h3 class="text-lg font-semibold">Faire un don</h3>
				</div>
				<p class="mt-2 text-base-content/70 text-sm leading-relaxed">
					Un don ponctuel ou régulier permet de financer l'hébergement et le temps de développement.
				</p>
				<button class="btn btn-sm btn-outline mt-4" disabled> Bientôt disponible </button>
			</div>

			<div class="card bg-base-100 border border-base-200 p-6">
				<div class="flex items-center gap-3 my-2">
					<Megaphone size={32} class="text-primary" />
					<h3 class="text-lg font-semibold">Parler de benevio</h3>
				</div>
				<p class="mt-2 text-base-content/70 text-sm leading-relaxed">
					Le bouche-à-oreille est notre meilleur vecteur de croissance. Partage l'outil avec ton
					réseau d'organisateurs.
				</p>
			</div>
		</div>
	</section>

	<section class="flex flex-col gap-6">
		<h2 class="text-2xl font-bold text-primary">Comment participer ?</h2>

		<div class="grid gap-6 md:grid-cols-2">
			<div class="card bg-base-100 border border-base-200 p-6">
				<div class="flex items-center gap-3 my-2">
					<MessageCircleQuestionMark size={32} class="text-primary" />
					<h3 class="text-lg font-semibold">Signaler</h3>
				</div>
				<p class="mt-2 text-base-content/70 text-sm leading-relaxed">
					Un retour, un bug ou une suggestion d'amélioration est une contribution précieuse.
				</p>
				<a
					href="https://github.com/peufo/benev/issues"
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-sm btn-outline mt-4"
				>
					Ouvrir un sujet
				</a>
			</div>

			<div class="card bg-base-100 border border-base-200 p-6">
				<div class="flex items-center gap-3 my-2">
					<GitPullRequestArrow size={32} class="text-primary" />
					<h3 class="text-lg font-semibold">Contribuer au code</h3>
				</div>
				<p class="mt-2 text-base-content/70 text-sm leading-relaxed">
					Le projet est open source. Les développeurs peuvent proposer des correctifs ou des
					nouvelles fonctionnalités.
				</p>
				<a
					href="https://github.com/peufo/benev"
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-sm btn-outline mt-4"
				>
					Voir le repo
				</a>
			</div>
		</div>
	</section>
</div>
