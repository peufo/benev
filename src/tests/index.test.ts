import { describe, it } from 'vitest'
import { MemberConditions } from '$lib/member'
import type { ComponentProps, ComponentType } from 'svelte'
import { prisma } from '$lib/server'

describe('Conditions input component', () => {
	it('Mount condition input component', async ({ expect }) => {
		const memberFields = await prisma.field.findMany()

		const { instance, target } = mount(MemberConditions, { memberFields })

		expect(instance).toBeTruthy()
		expect(target.innerHTML).toContain('Conditions')

		const addBtn = target.querySelector('button')
		addBtn?.focus()
		await pause(300)
		const menuItems = target.querySelectorAll('li[role="menuitem"]') as NodeListOf<HTMLLIElement>
		menuItems.item(0).click()
		await pause(500)
		expect(target.innerHTML).toContain('Membre approuvé')
		console.log('PROUT', instance.conditions)
	})
})

function mount<_ComponentType extends ComponentType>(
	Component: _ComponentType,
	props: ComponentProps<InstanceType<_ComponentType>>
) {
	const target = document.createElement('div')
	document.body.appendChild(target)
	const instance = new Component({ target, props })
	return { instance, target }
}

async function pause(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}
