<script lang="ts" generics="Keys extends string">
	export let title: string
	let klass = ''
	export { klass as class }
	export let values: Record<Keys, number>
	export let getHref: (key: Keys) => string
	export let getLabel: (key: Keys) => string = (key) => key

	$: distribution = Object.entries(values) as [Keys, number][]
	$: total = Object.values<number>(values).reduce((acc, cur) => acc + cur, 0)
</script>

<div class="{klass} border p-2 rounded-lg">
	<h3 class="title-md p-2">{title}</h3>

	<div
		class="grid gap-y-1 gap-x-2 text-sm items-center p-1"
		style:grid-template-columns="min-content auto"
	>
		{#each distribution as [key, value]}
			{@const href = getHref(key)}
			{@const label = getLabel(key)}
			<span class="text-right font-medium">{value}</span>

			<a class="relative menu-item min-w-0" data-sveltekit-replacestate {href}>
				<span class="z-10 text-ellipsis overflow-hidden">
					{label}
				</span>
				<div
					class="absolute bg-primary/10 bottom-0 top-0 left-0 rounded"
					style:width="{total > 0 ? (value / total) * 100 : 0}%"
				/>
			</a>
		{:else}
			<div class="col-span-2">Aucun</div>
		{/each}
	</div>
</div>
