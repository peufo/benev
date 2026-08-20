<script lang="ts">
	import Register from './Register.svelte'

	let { data } = $props()
</script>

<Register {...data} />
