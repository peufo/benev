import { get } from 'svelte/store'
import { urlParam } from '$lib/store'
import { goto } from '$app/navigation'

export function bindValueWithParams(node: HTMLInputElement, { bindEnable = false }) {
	const { name } = node
	if (!name || !bindEnable) return

	const importValueFromParams = () => {
		const _urlParam = get(urlParam)
		const value = _urlParam.get(name)
		if (value) return (node.value = value)
	}

	const handleInput = () => {
		const _urlParam = get(urlParam)
		const newUrl = _urlParam.with({ [name]: node.value })
		goto(newUrl, { replaceState: true })
	}

	importValueFromParams()
	node.addEventListener('input', handleInput)

	return {
		destroy: () => {
			node.removeEventListener('input', handleInput)
		},
	}
}
export function bindCheckedWithParams(node: HTMLInputElement, { bindEnable = false }) {
	const { name } = node
	if (!name || !bindEnable) return

	const importValueFromParams = () => {
		const _urlParam = get(urlParam)
		if (!_urlParam.has(name)) return
		const paramValue = _urlParam.get(name)
		if (node.value === 'on') node.checked = paramValue === 'true'
		else node.checked = paramValue === node.value
	}

	const handleInput = () => {
		const _urlParam = get(urlParam)
		const newValue = node.value === 'on' ? (node.checked ? 'true' : 'false') : node.value
		const newUrl = _urlParam.with({ [name]: newValue })
		goto(newUrl, { replaceState: true })
	}

	importValueFromParams()
	node.addEventListener('input', handleInput)

	return {
		destroy: () => {
			node.removeEventListener('input', handleInput)
		},
	}
}
