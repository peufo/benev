<script lang="ts">
	import { mdiHeartOutline, mdiServerNetwork, mdiCodeBraces, mdiBugOutline } from '@mdi/js'
	import { Icon } from 'fuma'
</script>

<div class="max-w-3xl mx-auto flex flex-col gap-12 py-12 px-4">
	<!-- Hero -->
	<div class="text-center">
		<h1 class="text-4xl md:text-5xl font-bold text-[#0d3b66]">Soutenir Benev</h1>
		<p class="mt-4 text-lg text-base-content/70 max-w-xl mx-auto">
			Benev est gratuit parce que des personnes comme toi choisissent de le soutenir.
			Chaque contribution aide à maintenir et améliorer l'outil.
		</p>
	</div>

	<!-- Comment soutenir -->
	<section class="flex flex-col gap-6">
		<h2 class="text-2xl font-bold text-[#0d3b66]">Comment soutenir ?</h2>

		<div class="grid gap-6 md:grid-cols-2">
			<div class="card bg-base-100 border border-base-200 p-6">
				<Icon path={mdiHeartOutline} size={32} class="text-[#0d3b66]" />
				<h3 class="mt-4 text-lg font-semibold">Faire un don</h3>
				<p class="mt-2 text-base-content/70 text-sm leading-relaxed">
					Un don ponctuel ou régulier pour financer les coûts d'infrastructure et le temps de
					développement.
				</p>
				<button class="btn btn-sm btn-outline mt-4" disabled> Bientôt disponible </button>
			</div>

			<div class="card bg-base-100 border border-base-200 p-6">
				<Icon path={mdiBugOutline} size={32} class="text-[#0d3b66]" />
				<h3 class="mt-4 text-lg font-semibold">Signaler un problème</h3>
				<p class="mt-2 text-base-content/70 text-sm leading-relaxed">
					Un retour d'expérience, un bug ou une suggestion d'amélioration est déjà une contribution
					précieuse.
				</p>
				<a
					href="https://github.com/peufo/benev/issues"
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-sm btn-outline mt-4"
				>
					Ouvrir une issue
				</a>
			</div>

			<div class="card bg-base-100 border border-base-200 p-6">
				<Icon path={mdiCodeBraces} size={32} class="text-[#0d3b66]" />
				<h3 class="mt-4 text-lg font-semibold">Contribuer au code</h3>
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

			<div class="card bg-base-100 border border-base-200 p-6">
				<Icon path={mdiServerNetwork} size={32} class="text-[#0d3b66]" />
				<h3 class="mt-4 text-lg font-semibold">Parler de Benev</h3>
				<p class="mt-2 text-base-content/70 text-sm leading-relaxed">
					Le bouche-à-oreille est notre meilleur vecteur de croissance. Partage l'outil avec ton
					réseau d'organisateurs.
				</p>
			</div>
		</div>
	</section>

	<!-- À quoi servent les dons -->
	<section class="flex flex-col gap-4">
		<h2 class="text-2xl font-bold text-[#0d3b66]">À quoi servent les contributions ?</h2>
		<ul class="list-disc list-inside text-base-content/80 leading-relaxed flex flex-col gap-2">
			<li>Hébergement des serveurs et base de données</li>
			<li>Nom de domaine et services d'email</li>
			<li>Temps de développement pour les nouvelles fonctionnalités</li>
			<li>Maintenance, corrections de bugs et support</li>
		</ul>
	</section>

	<!-- Merci -->
	<section class="text-center py-8 bg-[#0d3b66] rounded-2xl text-white">
		<h3 class="text-xl font-bold">Merci d'utiliser Benev</h3>
		<p class="mt-2 text-white/80 max-w-md mx-auto">
			Que tu fasses un don ou non, le fait que tu utilises l'outil et que tu fasses confiance
			au projet est déjà un soutien énorme.
		</p>
	</section>
</div>
