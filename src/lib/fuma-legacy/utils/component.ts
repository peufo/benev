import type { Component, ComponentProps } from 'svelte'

export type Primitive = string | number | boolean

// Svelte 5: un composant est une fonction `Component<Props>` et non plus une classe
// `ComponentType<SvelteComponent>`; `InstanceType` n'a donc plus de sens ici.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyComponent = Component<any, any, any>

export type ComponentAndProps = {
	component: AnyComponent
	props: Record<string, unknown>
}

export function component<Comp extends AnyComponent>(
	component: Comp,
	props: ComponentProps<Comp>
): ComponentAndProps {
	return { component, props: props as Record<string, unknown> }
}
