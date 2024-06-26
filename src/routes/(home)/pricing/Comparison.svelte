<script lang="ts">
	import type { FormEventHandler } from 'svelte/elements'
	import { flip } from 'svelte/animate'
	import { tip } from 'fuma'
	import { debounce } from '$lib/debounce'
	import { apps } from './comparison'

	export let rates: Record<string, number> = {}

	let nbEvents = 1
	let nbMembers = 200

	const selectedCurrency = 'CHF'

	const getAmount = (amount: number, currency = selectedCurrency) => {
		if (selectedCurrency === currency) return amount
		const rateFrom = rates[selectedCurrency]
		const rateTo = rates[currency]
		if (!rateFrom || !rateFrom) return amount
		const rate = rateFrom / rateTo
		return amount * rate
	}

	const renderAmount = (amount: number) => {
		return amount.toLocaleString(undefined, {
			style: 'currency',
			currency: selectedCurrency,
			maximumFractionDigits: 0,
		})
	}

	$: _apps = apps
		.filter((app) => !app.hide)
		.map((app) => ({ ...app, tarif: getAmount(app.getTarif(nbEvents, nbMembers), app.currency) }))
		.sort((a, b) => a.tarif - b.tarif)
	$: tarifMax = Math.max(..._apps.map((app) => app.tarif))

	const handleInputNbEvents: FormEventHandler<HTMLInputElement> = (event) => {
		if (animated) event.currentTarget.valueAsNumber = nbEvents
		else nbEvents = Math.max(event.currentTarget.valueAsNumber, 1)
	}
	const handleInputNbMembers: FormEventHandler<HTMLInputElement> = (event) => {
		if (animated) event.currentTarget.valueAsNumber = nbMembers
		else nbMembers = Math.max(event.currentTarget.valueAsNumber, 0)
	}

	let animated = false
	const ANIMATION_DURATION = 300
	const animationEnd = debounce(() => (animated = false), ANIMATION_DURATION)
	const handleAnimationStart = () => {
		animated = true
		animationEnd()
	}
</script>

<div class="border p-4 rounded-lg">
	<p class="text-sm opacity-90 my-4 text-center">
		Coûts pour
		<input
			type="number"
			inputmode="numeric"
			min={1}
			max={1_000}
			value={nbEvents}
			on:input={handleInputNbEvents}
			class="w-12 inline-block text-center border rounded font-medium"
		/>
		événement{nbEvents > 1 ? 's' : ''} de
		<input
			type="number"
			inputmode="numeric"
			min={0}
			max={100_000}
			step={10}
			value={nbMembers}
			on:input={handleInputNbMembers}
			class="w-12 inline-block text-center border rounded font-medium"
		/>
		membre{nbMembers > 1 ? 's' : ''}
	</p>

	{#each _apps as app (app.name)}
		<div
			class="pt-2"
			animate:flip={{ duration: ANIMATION_DURATION }}
			on:animationstart={handleAnimationStart}
		>
			<div>
				<a href={app.href} target="_blank" class="font-medium opacity-80 hover:opacity-100 text-sm">
					{app.name}
				</a>
			</div>
			<div
				class="flex items-center gap-2"
				use:tip={{ disable: !app.conditions, content: app.conditions }}
			>
				<div
					class="h-2 rounded {app.name === 'benev.io' ? 'bg-primary' : 'bg-warning'}"
					style:width="{75 * (app.tarif / tarifMax)}%"
				/>
				<span class="text-xs font-medium">
					{renderAmount(app.tarif)}
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
