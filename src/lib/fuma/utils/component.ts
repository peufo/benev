import type { ComponentProps, ComponentType } from 'svelte'

export type Primitive = string | number | boolean

export type ComponentAndProps = {
	component: ComponentType
	props: ComponentProps<InstanceType<ComponentType>>
}

export function component<Component extends ComponentType>(
	component: Component,
	props: ComponentProps<InstanceType<Component>>
): ComponentAndProps {
	return { component, props }
}
