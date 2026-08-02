export { default as Tabs } from '$lib/fuma-legacy/ui/tabs/Tabs.svelte'
export { default as TabsIcon } from '$lib/fuma-legacy/ui/tabs/TabsIcon.svelte'

import type { IconProps } from '@lucide/svelte'
import type { Component } from 'svelte'

export type Tab = {
	href: string
	isActive?: boolean
	label: string
	icon: Component<IconProps>
}
