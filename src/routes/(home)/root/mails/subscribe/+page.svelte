<script lang="ts">
	import {
		EmailSubscribeRequest,
		EmailSubscribeAccepted,
		EmailSubscribeDenied,
		EmailSubscribeCancelled,
	} from '$lib/email'

	export let data
</script>

<EmailSubscribeRequest {...data} />
<EmailSubscribeAccepted {...data} />
<EmailSubscribeDenied {...data} />
<EmailSubscribeCancelled {...data} />
