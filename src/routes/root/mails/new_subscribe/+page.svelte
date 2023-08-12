<script lang="ts">
	import { EmailNewSubscribe, EmailSubscribeState } from '$lib/email'

	export let data
</script>

<EmailNewSubscribe subscribe={data.subscribe} />

<EmailSubscribeState subscribe={data.subscribe} />
