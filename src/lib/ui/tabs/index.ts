export { default as Tabs } from '$lib/ui/tabs/Tabs.svelte'
export { default as TabsIcon } from '$lib/ui/tabs/TabsIcon.svelte'

import type { IconProps } from '@lucide/svelte'
import type { Component } from 'svelte'

export type Tab = {
	href: string
	isActive?: boolean
	label: string
	icon: Component<IconProps>
}
