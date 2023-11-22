<script lang="ts">
	let klass = ''
	export { klass as class }
	export let formaction: string
	export let disabled = false
	export let btn = true

	let button: HTMLButtonElement
	let width = 0
	let ready = false
	let timeout: NodeJS.Timeout
	function handleClick(event: MouseEvent) {
		if (ready) return
		width = button.offsetWidth
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
	bind:this={button}
	class={klass}
	class:btn
	class:btn-error={btn && ready}
	class:btn-outline={btn && ready}
	class:text-error={btn && !ready}
	class:btn-ghost={btn && !ready}
	class:btn-disabled={disabled}
	style:width={ready ? `${width}px` : ''}
	on:click={handleClick}
	on:mouseleave={handleLeave}
	formaction={ready ? formaction : undefined}
>
	{#if ready}
		<slot name="ready"><span>T'es sur ?</span></slot>
	{:else}
		<slot>Supprimer</slot>
	{/if}
</button>
