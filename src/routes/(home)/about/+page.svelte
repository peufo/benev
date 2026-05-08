<script lang="ts">
	import { mdiHeartOutline, mdiOpenSourceInitiative, mdiEyeOutline, mdiTarget } from '@mdi/js'
	import { Icon } from 'fuma'
</script>

<div class="max-w-3xl mx-auto flex flex-col gap-12 py-12 px-4">
	<!-- Hero -->
	<div class="text-center">
		<h1 class="text-4xl md:text-5xl font-bold text-[#0d3b66]">
			Vraiment gratuit ?
		</h1>
		<p class="mt-4 text-lg text-base-content/70 max-w-xl mx-auto">
			Oui. Et ce n'est pas moins solide que les solutions payantes. C'est juste plus honnête.
		</p>
	</div>

	<!-- Solide -->
	<section class="flex flex-col gap-4">
		<div class="flex items-center gap-3">
			<div class="w-10 h-10 rounded-xl bg-[#0d3b66] flex items-center justify-center text-white">
				<Icon path={mdiTarget} size={24} />
			</div>
			<h2 class="text-2xl font-bold text-[#0d3b66]">Pas de marketing, juste du produit</h2>
		</div>
		<p class="text-base-content/80 leading-relaxed">
			La plupart des outils payants facturent cher parce qu'ils dépensent des fortunes en publicité,
			en vente et en croissance à tout prix. Nous, on fait le choix inverse :
			<strong>on investit notre temps dans le produit, pas dans les campagnes publicitaires</strong>.
		</p>
		<p class="text-base-content/80 leading-relaxed">
			Résultat : un outil aussi robuste et éprouvé que la concurrence, sans le prix qui va avec.
			Pas d'équipe commerciale, pas de stand à des salons, pas de pubs sponsorisées.
			Juste un logiciel qui fonctionne bien.
		</p>
	</section>

	<!-- Donationware -->
	<section class="flex flex-col gap-4">
		<div class="flex items-center gap-3">
			<div class="w-10 h-10 rounded-xl bg-[#0d3b66] flex items-center justify-center text-white">
				<Icon path={mdiHeartOutline} size={24} />
			</div>
			<h2 class="text-2xl font-bold text-[#0d3b66]">Un modèle donationware</h2>
		</div>
		<p class="text-base-content/80 leading-relaxed">
			Benev est entièrement gratuit à utiliser. Il n'y a pas de limite artificielle, pas de fonctionnalité
			bloquée derrière un paywall. Le projet repose sur un principe simple : <strong>si l'outil t'est utile,
			tu peux choisir de soutenir son développement</strong> par une donation.
		</p>
		<p class="text-base-content/80 leading-relaxed">
			Ce modèle nous permet de rester indépendants, de ne pas vendre de données et de ne pas
			transformer les utilisateurs en produits.
		</p>
	</section>

	<!-- Open Source -->
	<section class="flex flex-col gap-4">
		<div class="flex items-center gap-3">
			<div class="w-10 h-10 rounded-xl bg-[#0d3b66] flex items-center justify-center text-white">
				<Icon path={mdiOpenSourceInitiative} size={24} />
			</div>
			<h2 class="text-2xl font-bold text-[#0d3b66]">Open source</h2>
		</div>
		<p class="text-base-content/80 leading-relaxed">
			Le code de Benev est public et disponible sur GitHub. N'importe qui peut l'auditer,
			suggérer des améliorations ou le déployer sur ses propres serveurs.
		</p>
		<a
			href="https://github.com/peufo/benev"
			target="_blank"
			rel="noopener noreferrer"
			class="btn btn-outline w-fit"
		>
			Voir le code sur GitHub
		</a>
	</section>

	<!-- Transparence -->
	<section class="flex flex-col gap-4">
		<div class="flex items-center gap-3">
			<div class="w-10 h-10 rounded-xl bg-[#0d3b66] flex items-center justify-center text-white">
				<Icon path={mdiEyeOutline} size={24} />
			</div>
			<h2 class="text-2xl font-bold text-[#0d3b66]">Transparence</h2>
		</div>
		<p class="text-base-content/80 leading-relaxed">
			Nous croyons que la confiance se mérite par la transparence. Prochainement, cette page
			accueillera un suivi détaillé du projet : temps de développement, coûts d'infrastructure,
			dons reçus et utilisation des fonds.
		</p>
		<div class="alert alert-info">
			<span>Le suivi de projet est en cours de construction. Reviens bientôt !</span>
		</div>
	</section>

	<!-- CTA -->
	<section class="text-center py-8 bg-[#c7b198]/10 rounded-2xl">
		<h3 class="text-xl font-bold text-[#0d3b66]">Envie de contribuer ?</h3>
		<p class="mt-2 text-base-content/70 max-w-md mx-auto">
			Que ce soit par un don, un retour d'expérience ou une contribution au code, chaque geste compte.
		</p>
		<a href="/support" class="btn btn-primary bg-[#0d3b66] border-[#0d3b66] text-white mt-4">
			Soutenir le projet
		</a>
	</section>
</div>
