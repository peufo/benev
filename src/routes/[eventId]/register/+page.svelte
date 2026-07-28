<script lang="ts">
	import Register from './Register.svelte'

	let { data } = $props()
</script>

<Register event={data.event} user={data.user} member={data.member} charter={data.charter} />
