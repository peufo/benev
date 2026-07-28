<script lang="ts">
	import { ChevronDown } from '@lucide/svelte'

	interface Props {
		title: string;
		step?: number | undefined;
		required?: boolean | undefined;
		open?: boolean;
		collapsible?: boolean;
		children?: import('svelte').Snippet;
	}

	let {
		title,
		step = undefined,
		required = undefined,
		open = $bindable(false),
		collapsible = true,
		children
	}: Props = $props();

	function toggle() {
		if (!collapsible) return
		open = !open
	}
</script>

<div class="card bg-base-100 border border-base-200 rounded-2xl overflow-hidden">
	<button
		type="button"
		class="w-full py-4 px-5 flex items-center gap-3 text-left rounded-2xl"
		class:cursor-default={!collapsible}
		onclick={toggle}
	>
		{#if step !== undefined}
			<div
				class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors duration-200"
				class:bg-primary={open}
				class:text-primary-content={open}
				class:bg-base-200={!open}
				class:text-base-content={!open}
			>
				{step}
			</div>
		{/if}
		<div class="flex-1">
			<h3 class="font-bold text-base-content leading-tight">{title}</h3>
			{#if required !== undefined}
				<p class="text-xs text-base-content/60">{required ? 'Obligatoire' : 'Optionnel'}</p>
			{/if}
		</div>
		{#if collapsible}
			<div class="transition-transform duration-300" class:rotate-180={open}>
				<ChevronDown class="w-5 h-5 text-base-content/60" strokeWidth={2.5} />
			</div>
		{/if}
	</button>

	<div
		class="grid transition-all duration-200 ease-out"
		class:grid-rows-[1fr]={open}
		class:grid-rows-[0fr]={!open}
	>
		<div class="overflow-hidden px-5" class:pb-5={open}>
			{@render children?.()}
		</div>
	</div>
</div>
