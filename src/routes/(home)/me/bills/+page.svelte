<script lang="ts">
	export let data
</script>

<pre>{JSON.stringify(
		data.checkouts.filter((c) => c.payment_status === 'paid'),
		null,
		2
	)}</pre>
