<script lang="ts">
	import { ImageOff } from 'lucide-svelte'

	export let icon: string
	let klass = ''
	export { klass as class }
	export let alt = "Icon de l'évènement"

	let isError = false

	function hideOnError(node: HTMLImageElement) {
		function onError() {
			console.error(`Failed to load image: ${node.src}`)
			isError = true
		}
		node.addEventListener('error', onError)
		return {
			destroy() {
				node.removeEventListener('error', onError)
			},
			update() {
				isError = false
			},
		}
	}
</script>

{#if isError}
	<ImageOff class="{klass} opacity-70" />
{:else}
	<img src={icon} {alt} class={klass} referrerpolicy="no-referrer" use:hideOnError />
{/if}
