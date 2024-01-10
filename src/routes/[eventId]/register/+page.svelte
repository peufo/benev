<script lang="ts">
	import Register from './Register.svelte'

	export let data
</script>

<Register event={data.event} user={data.user} member={data.member} stepIndex={data.stepIndex} />
