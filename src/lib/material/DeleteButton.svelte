<script lang="ts">
	let klass = ''
	export { klass as class }
	export let formaction: string
	export let disabled = false

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
	class="
			btn
			{ready ? 'btn-error btn-outline w-28' : 'text-error btn-ghost'}
			{klass}
		"
	style:width={ready ? `${width}px` : ''}
	class:btn-disabled={disabled}
	on:click={handleClick}
	on:mouseleave={handleLeave}
	formaction={ready ? formaction : undefined}
>
	{#if ready}
		<span>T'es sur ?</span>
	{:else}
		<slot>Supprimer</slot>
	{/if}
</button>
