<script lang="ts">
	import { resolve } from '$app/paths'
	interface Props {
		user?: { email?: string } | null
	}

	let { user = null }: Props = $props()
</script>

<section class="py-20 md:py-28 bg-primary">
	<div class="max-w-4xl mx-auto px-4 sm:px-6">
		<div class="grid md:grid-cols-2 gap-10 items-center">
			<div>
				<h2 class="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
					Prêt à simplifier ta prochaine édition ?
				</h2>
				<p class="mt-4 text-lg text-white/70 leading-relaxed">
					Rejoins celles et ceux qui passent moins de temps sur l'admin et plus sur leur événement.
				</p>
			</div>

			<div class="flex flex-col items-center gap-4">
				<a href={resolve('/me')} class="btn btn-lg btn-secondary">
					{user ? 'Voir mes événements' : 'Essayer Benevio'}
				</a>

				<a
					href={resolve('/open-source')}
					class="btn btn-lg btn-ghost text-white hover:text-primary"
				>
					Contribuer
				</a>
			</div>
		</div>
	</div>
</section>
