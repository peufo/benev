export { default as Tabs } from '$lib/fuma-legacy/ui/tabs/Tabs.svelte'
export { default as TabsIcon } from '$lib/fuma-legacy/ui/tabs/TabsIcon.svelte'

export type Tab = {
	href: string
	isActive?: boolean
	label: string
	icon: string
}
