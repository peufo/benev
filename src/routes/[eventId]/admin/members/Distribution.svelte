<script lang="ts" generics="Keys extends string">
	import { CardBasic } from 'fuma'

	export let title: string
	let klass = ''
	export { klass as class }
	export let values: Record<Keys, number>
	export let getHref: (key: Keys) => string
	export let getLabel: (key: Keys) => string = (key) => key

	$: distribution = Object.entries(values) as [Keys, number][]
	$: total = Object.values<number>(values).reduce((acc, cur) => acc + cur, 0)
</script>

<CardBasic {title} class={klass}>
	<div class="grid gap-2 text-sm items-center" style:grid-template-columns="min-content auto">
		{#each distribution as [key, value]}
			{@const href = getHref(key)}
			{@const label = getLabel(key)}
			<span class="text-right font-medium">{value}</span>

			<a class="relative menu-item" data-sveltekit-replacestate {href}>
				<span class="z-10">
					{label}
				</span>
				<div
					class="absolute bg-primary/10 bottom-0 top-0 left-0 rounded"
					style:width="{(value / total) * 100}%"
				/>
			</a>
		{:else}
			<div class="col-span-2">Aucun</div>
		{/each}
	</div>
</CardBasic>
