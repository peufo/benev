<script lang="ts">
	import { Card, Icon } from '$lib/material'
	import { mdiPlus } from '@mdi/js'
	import Comparison from './Comparison.svelte'

	export let data
</script>

<div class="mx-auto max-w-lg">
	<Card>
		<h2 slot="title" class="text-center text-xl">Tarif unique</h2>
		<div class="mt-2 mb-6 grid mx-auto" style:grid-template-columns="1fr 50px 1fr">
			<div class="flex flex-col items-center whitespace-nowrap">
				<span class="font-medium">8,00 CHF</span>
				<span class="text-xs">par événement</span>
			</div>

			<Icon path={mdiPlus} class="opacity-70" />

			<div class="flex flex-col items-center whitespace-nowrap">
				<span class="font-medium">0,30 CHF</span>
				<span class="text-xs">par membre</span>
			</div>
		</div>

		<Comparison rates={data.rates} />

		<div class="grid place-content-center mt-12 mb-6">
			<a href="/me" class="btn btn-secondary"> Essayer maintenant </a>
		</div>
	</Card>
</div>
