<script lang="ts">
	let klass = ''
	export { klass as class }
	export let formaction: string
	export let disabled = false

	let ready = false
	let timeout: NodeJS.Timeout
	function handleClick(event: MouseEvent) {
		if (ready) return
		event.preventDefault()
		ready = true
		timeout = setTimeout(() => (ready = false), 2000)
	}

	function handleLeave() {
		ready = false
		clearTimeout(timeout)
	}
</script>

<button
	class="
			btn w-28
			{ready ? 'btn-error btn-outline w-28' : 'text-error btn-ghost'}
			text-error btn-ghost
			{klass}
		"
	class:btn-disabled={disabled}
	on:click={handleClick}
	on:mouseleave={handleLeave}
	formaction={ready ? formaction : undefined}
>
	{ready ? "T'es sur ?" : 'Supprimer'}
</button>
