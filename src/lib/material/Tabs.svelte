<script lang="ts">
	import { Icon } from '$lib/material'

	type Tab = {
		href: string
		isActive: boolean
		label: string
		icon: string
	}

	export let tabs: Tab[]
</script>

<div class="sticky top-0 bg-base-100 shadow-sm z-10 flex gap-2 p-2 border-b bordered rounded-t-2xl">
	{#each tabs as tab}
		<a
			href={tab.href}
			class="
        menu-item grow justify-center flex-col gap-0 text-sm py-2
        lg:flex-row lg:text-base lg:gap-3 rounded-lg
      "
			class:active={tab.isActive}
		>
			<Icon path={tab.icon} size={20} class="opacity-70" active={tab.isActive} />
			<span class="whitespace-nowrap hidden sm:block">{tab.label}</span>
		</a>
	{/each}
</div>
