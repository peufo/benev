<script lang="ts">
	import { mdiWeb, mdiAccountGroupOutline, mdiViewDashboardOutline } from '@mdi/js'
	import { Icon } from 'fuma'

	const benefits = [
		{
			icon: mdiWeb,
			title: 'Ton événement, ton site',
			description:
				'Crée un espace dédié avec des pages personnalisables pour centraliser toute la communication.',
		},
		{
			icon: mdiAccountGroupOutline,
			title: 'Gestion d\'équipe collaborative',
			description:
				'Désigne des administrateurs et des responsables de secteur pour t\'aider dans l\'organisation.',
		},
		{
			icon: mdiViewDashboardOutline,
			title: 'Bénévoles autonomes',
			description:
				'Chaque bénévole gère ses inscriptions, accède à son tableau de bord et reçoit les notifications.',
		},
	]
</script>

<section class="py-20 md:py-28 bg-[#c7b198]/15">
	<div class="max-w-5xl mx-auto px-4 sm:px-6">
		<div class="text-center mb-16 md:mb-20">
			<h2 class="text-3xl md:text-4xl font-bold text-[#0d3b66]">
				Ce que Benev fait pour toi
			</h2>
			<p class="mt-4 text-lg text-base-content/70 max-w-xl mx-auto">
				Pas une liste interminable de fonctionnalités. Juste l'essentiel, bien fait.
			</p>
		</div>

		<div class="grid gap-8 md:grid-cols-3">
			{#each benefits as benefit}
				<div class="group text-center">
					<div
						class="
							inline-flex items-center justify-center w-14 h-14 rounded-2xl
							bg-[#0d3b66] text-white
							group-hover:bg-[#092b4d]
							transition-colors duration-300
						"
					>
						<Icon path={benefit.icon} size={28} class="[&_path]:fill-white" />
					</div>

					<h3 class="mt-5 text-xl font-semibold text-[#0d3b66]">
						{benefit.title}
					</h3>

					<p class="mt-3 text-base-content/70 leading-relaxed">
						{benefit.description}
					</p>
				</div>
			{/each}
		</div>
	</div>
</section>
