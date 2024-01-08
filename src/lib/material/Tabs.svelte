<script lang="ts">
	import { page } from '$app/stores'
	import type { Tab } from '$lib/types'
	import { Icon } from '$lib/material'

	export let tabs: Tab[]
	let klass = ''
	export { klass as class }
</script>

<div
	class="
	sticky top-0 bg-base-100 shadow-sm z-20 flex gap-2 p-2 border-b bordered rounded-t-2xl
	{klass}
	"
>
	{#each tabs as tab}
		{@const active = tab.isActive ?? $page.url.pathname.startsWith(tab.href)}
		<a
			href={tab.href}
			class="
        menu-item grow justify-center flex-col gap-0 text-sm py-2
        lg:flex-row lg:text-base lg:gap-3 rounded-lg
      "
			class:active
		>
			<Icon path={tab.icon} size={20} class="opacity-70" />
			<span class="whitespace-nowrap hidden sm:block">{tab.label}</span>
		</a>
	{/each}
</div>
