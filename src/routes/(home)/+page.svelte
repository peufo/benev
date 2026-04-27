<script lang="ts">
	import logo from '$lib/assets/logo.svg'

	import Benev from '$lib/Benev.svelte'
	import { Card } from 'fuma'
	import { Features } from '$lib/features'
	import { Testimonials } from '$lib/testimonials'

	export let data
</script>

<div class="relative">
	<div class="max-w-lg mx-auto flex flex-col py-16">
		<Card class="border-base-200/60 shadow-xl">
			<div class="text-center">
				<img src={logo} alt="Logo benev" class="w-36 mx-auto mt-8" />

				<h1 class="mt-2 text-4xl">
					<Benev />
				</h1>

				<h2 class="text-base-content/70 mt-12 text-lg font-medium">
					Ta plateforme de gestion de bénévoles
				</h2>

				<div class="mt-4 flex justify-center gap-2 flex-wrap">
					<span class="badge badge-primary badge-outline shadow-sm">simple</span>
					<span class="badge badge-secondary badge-outline shadow-sm">open source</span>
					<span class="badge badge-primary badge-outline shadow-sm">abordable</span>
				</div>
			</div>

			<div class="grid place-content-center mt-12 mb-10">
				<a href="/me" class="btn btn-primary shadow-lg hover:shadow-xl transition-shadow">
					{data.user ? 'Voir mes évènements' : 'Essayer maintenant'}
				</a>
			</div>
		</Card>
	</div>
</div>

<Features />

<Testimonials />
