<script lang="ts" module>
	type _Slot =
		| ((...args: any) => ComponentAndProps | ComponentType | string)
		| ComponentAndProps
		| ComponentType
		| string
	//
</script>

<script lang="ts" generics="Slot extends _Slot">
	import { type ComponentType } from 'svelte'

	import { component, type ComponentAndProps } from '$lib/fuma/utils/component.js'
	import Span from '$lib/fuma/ui/slot/Span.svelte'

	type Args = Slot extends (...args: any) => any ? Parameters<Slot>[0] : undefined

	

	interface Props {
		slot?: Slot | null;
		args?: Args | null;
		children?: import('svelte').Snippet;
	}

	let { slot = undefined, args = undefined, children }: Props = $props();

	function getComponentAndProps(_slot: Slot): ComponentAndProps | null {
		if (typeof _slot === 'function') {
			if (isComponentType(_slot)) return { component: _slot, props: {} }
			if (!args) {
				console.error('args prop is required with slot as function')
				return null
			}
			const result = _slot(args) as Slot
			return getComponentAndProps(result)
		}
		if (typeof _slot === 'object') return _slot
		return component(Span, { content: _slot })
	}

	function isComponentType(fun: Function): fun is ComponentType {
		return !!fun.prototype?.constructor?.name
	}
</script>

{#if slot}
	{@const s = getComponentAndProps(slot)}
	{#if s !== null}
		<s.component {...s.props} />
	{/if}
{:else}
	{@render children?.()}
{/if}
