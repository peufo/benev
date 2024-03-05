import { describe, it } from 'vitest'
import Footer from '$lib/Footer.svelte'

describe('Conditions input component', () => {
	it('Mount footer', ({ expect }) => {
		const target = document.createElement('div')
		document.body.appendChild(target)
		const footer = new Footer({ target })
		expect(footer).toBeTruthy()
		expect(target.innerHTML).toContain('Dev Voisard')
	})
})
