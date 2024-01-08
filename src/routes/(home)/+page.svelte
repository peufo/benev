<script lang="ts">
	import logo from '$lib/assets/logo.svg'

	import Benev from '$lib/Benev.svelte'

	export let data
</script>

<div class="max-w-lg mx-auto">
	<div class="card bg-base-100 shadow">
		<div class="card-body">
			<div class="text-center">
				<img src={logo} alt="Logo benev" class="w-36 mx-auto mt-8" />

				<h1 class="mt-2 text-4xl">
					<Benev />
				</h1>

				<h2 class="text-base-content/80 mt-12">Ta plateforme de gestion de bénévoles</h2>

				<div class="mt-3 flex justify-center gap-2">
					<span class="badge text-base-content/80 shadow-md">simple</span>
					<span class="badge text-base-content/80 shadow-md">open source</span>
					<span class="badge text-base-content/80 shadow-md">abordable</span>
				</div>
			</div>

			<div class="grid place-content-center mt-12 mb-10">
				<a href="/me" class="btn btn-primary">
					{data.user ? 'Voir mes évènements' : 'Essayer maintenant'}
				</a>
			</div>
		</div>
	</div>
</div>
