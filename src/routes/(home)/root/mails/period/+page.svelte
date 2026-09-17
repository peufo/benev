<script lang="ts">
	import { EmailPeriodChanged } from '$lib/email'

	let { data } = $props()
</script>

<EmailPeriodChanged {...data} />
<hr />
<EmailPeriodChanged {...data} after={null} />
