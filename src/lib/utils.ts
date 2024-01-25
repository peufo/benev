import type { ComponentProps, ComponentType } from 'svelte'
import dayjs from 'dayjs'

export const getAge = (date: Date | null) => {
	const day = dayjs()
	if (!date) return '-'
	return day.diff(dayjs(date), 'year') + ' ans'
}

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
