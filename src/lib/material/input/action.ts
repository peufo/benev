import { get } from 'svelte/store'
import { urlParam } from '$lib/store'
import { goto } from '$app/navigation'
import { debounce } from '$lib/debounce'
import { unknown } from 'zod'

export function bindValueWithParams(
	node: HTMLInputElement,
	{ bindEnable = false, debounceTime = 250, setValue = (value: string) => (node.value = value) }
) {
	const { name } = node
	if (!name || !bindEnable) return

	const importValueFromParams = () => {
		const _urlParam = get(urlParam)
		const value = _urlParam.get(name)
		if (value) return setValue(value)
	}

	const handleInput = debounce(async () => {
		const _urlParam = get(urlParam)
		const newUrl = node.value ? _urlParam.with({ [name]: node.value }) : _urlParam.without(name)
		await goto(newUrl, { replaceState: true, keepFocus: true, noScroll: true })
	}, debounceTime)

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

	const handleInput = async () => {
		const newValue = node.value === 'on' ? (node.checked ? 'true' : 'false') : node.value
		const newUrl = get(urlParam).with({ [name]: newValue })
		await goto(newUrl, { replaceState: true, keepFocus: true, noScroll: true })
	}

	importValueFromParams()
	node.addEventListener('input', handleInput)

	return {
		destroy: () => {
			node.removeEventListener('input', handleInput)
		},
	}
}
