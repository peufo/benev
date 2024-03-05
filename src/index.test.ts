import { describe, it, expect } from 'vitest'
import Footer from '$lib/Footer.svelte'

describe('Basique test', () => {
	it('Mount footer', () => {
		const target = document.createElement('div')
		document.body.appendChild(target)
		const footer = new Footer({ target })
		expect(footer).toBeTruthy()
		expect(target.innerHTML).toContain('Dev Voisard')
	})
})
