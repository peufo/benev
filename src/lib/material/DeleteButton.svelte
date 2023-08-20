<script lang="ts">
	let klass = ''
	export { klass as class }
	export let formaction: string
	export let disabled = false

	let ready = false
	let timeout: NodeJS.Timeout
	function handleClick() {
		ready = true
		timeout = setTimeout(() => (ready = false), 2000)
	}

	function handleLeave() {
		ready = false
		clearTimeout(timeout)
	}
</script>

{#if !ready}
	<button
		class="btn text-error btn-ghost w-28 {klass}"
		class:btn-disabled={disabled}
		on:click={handleClick}
	>
		Supprimer
	</button>
{:else}
	<button class="btn btn-error btn-outline w-28" {formaction} on:mouseleave={handleLeave}>
		T'es sur ?
	</button>
{/if}
