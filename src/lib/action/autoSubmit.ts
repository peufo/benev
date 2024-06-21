import { debounce } from '$lib/debounce'

type AutoSubmitOption = {
	debounceMs?: number
}

export function autoSubmit(form: HTMLFormElement, options?: AutoSubmitOption) {
	const { debounceMs = 0 } = options || {}

	const btn = document.createElement('button')
	btn.type = 'submit'
	btn.style.display = 'none'
	const onChange = debounce(() => btn.click(), debounceMs)
	form.appendChild(btn)
	form.addEventListener('change', onChange)

	function destroy() {
		btn.remove()
		onChange.flush()
		form.removeEventListener('change', onChange)
	}

	return { destroy }
}
