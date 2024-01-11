import type { ComponentProps, ComponentType } from 'svelte'

type ComponentAndProps = {
	component: ComponentType
	props: ComponentProps<InstanceType<ComponentType>>
}
type Primitive = string | number | boolean
export type Cell = ComponentAndProps | Primitive | Primitive[]

export type TableField<Item> = {
	key: string
	label: string
	hint?: string
	position?: number
	getCell: (item: Item) => Cell
	filter?: ComponentAndProps
}

export function component<Component extends ComponentType>(
	component: Component,
	props: ComponentProps<InstanceType<Component>>
): ComponentAndProps {
	return { component, props }
}
