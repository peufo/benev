<script lang="ts">
	import { tip } from '$lib/action'

	import { apps } from './comparison'

	export let rates: Record<string, number> = {}

	let nbEvents = 1
	let nbMembers = 250

	const selectedCurrency = 'CHF'

	const renderAmount = (amount: number, currency = selectedCurrency) => {
		const rateFrom = rates[selectedCurrency]
		const rateTo = rates[currency]
		if (!rateFrom || !rateFrom || selectedCurrency === currency)
			return amount.toLocaleString(undefined, {
				style: 'currency',
				currency,
				maximumFractionDigits: 0,
			})

		const rate = rateFrom / rateTo
		return (amount * rate).toLocaleString(undefined, {
			style: 'currency',
			currency: selectedCurrency,
			maximumFractionDigits: 0,
		})
	}

	$: _apps = apps
		.filter((app) => !app.hide)
		.map((app) => ({ ...app, tarif: app.getTarif(nbEvents, nbMembers) }))
		.sort((a, b) => a.tarif - b.tarif)
	$: tarifMax = Math.max(..._apps.map((app) => app.tarif))
</script>

<div class="border p-4 rounded-lg">
	<p class="text-sm opacity-90 my-4 text-center">
		Coûts pour
		<input
			type="number"
			min={1}
			max={1_000}
			bind:value={nbEvents}
			class="w-12 inline-block text-center border rounded font-medium"
		/>
		événement{nbEvents > 1 ? 's' : ''} de
		<input
			type="number"
			min={0}
			max={100_000}
			step={10}
			bind:value={nbMembers}
			class="w-12 inline-block text-center border rounded font-medium"
		/>
		membre{nbMembers > 1 ? 's' : ''}
	</p>

	{#each _apps as app (app.name)}
		<div class="pt-2">
			<div>
				<a href={app.href} target="_blank" class="font-medium opacity-80 hover:opacity-100 text-sm">
					{app.name}
				</a>
			</div>
			<div
				class="flex items-center gap-2"
				use:tip={{ disable: !app.conditions, content: app.conditions }}
			>
				<div class="bg-warning h-2 rounded" style:width="{75 * (app.tarif / tarifMax)}%" />
				<span class="text-xs font-medium">
					{renderAmount(app.tarif, app.currency)}
				</span>
			</div>
		</div>
	{/each}

	<p class="text-xs opacity-80 mb-2 mt-6 text-center">
		Estimations calculées sur les tarifs connus en novembre 2023.<br />
		Les taux de changes du jour sont utilisés.<br />
		Tu peux proposer une correction
		<a
			class="link"
			target="_blank"
			href="https://github.com/peufo/benev/edit/main/src/routes/(home)/pricing/comparison.ts"
		>
			sur cette page.
		</a>
	</p>
</div>
