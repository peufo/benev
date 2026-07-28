import debounce from 'debounce'
import { urlParam } from 'fuma'
import { goto } from '$app/navigation'

type BindOptions = {
	bindEnable?: boolean
	listenerType?: 'input' | 'click'
	debounceTime?: number
	initValue?: (initalValue: string) => unknown
}

export function bindValueWithParams(
	node: HTMLInputElement | HTMLButtonElement,
	{
		bindEnable = false,
		debounceTime = 200,
		initValue = (initalValue: string) => (node.value = initalValue),
		listenerType = 'input',
	}: BindOptions
) {
	const { name } = node
	if (!name || !bindEnable) return

	const importValueFromParams = () => {
		const value = urlParam.get(name)
		if (value) return initValue(value)
	}

	const handleInput = debounce(async () => {
		const newUrl = node.value
			? urlParam.with({ [name]: node.value }, 'skip', 'take')
			: urlParam.without(name, 'skip', 'take')
		await goto(newUrl, { replaceState: true, keepFocus: true, noScroll: true })
	}, debounceTime)

	importValueFromParams()
	node.addEventListener(listenerType, handleInput)

	return {
		destroy() {
			node.removeEventListener(listenerType, handleInput)
		},
	}
}

export function bindCheckedWithParams(
	node: HTMLInputElement,
	{
		bindEnable = false,
		listenerType = 'input',
		debounceTime = 0,
		initValue = (initalValue: string) => (node.checked = node.value === initalValue),
	}: BindOptions
) {
	const { name } = node
	if (!name || !bindEnable) return

	const importValueFromParams = () => {
		if (!urlParam.has(name)) return
		const paramValue = urlParam.get(name)
		if (paramValue) initValue(paramValue)
	}

	const handleInput = debounce(async () => {
		const newUrl = node.checked
			? urlParam.with({ [name]: node.value }, 'skip', 'take')
			: urlParam.without(name, 'skip', 'take')
		await goto(newUrl, { replaceState: true, keepFocus: true, noScroll: true })
	}, debounceTime)

	importValueFromParams()
	node.addEventListener(listenerType, handleInput)

	return {
		destroy: () => {
			node.removeEventListener(listenerType, handleInput)
		},
	}
}
