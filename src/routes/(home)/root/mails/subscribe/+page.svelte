<script lang="ts">
	import {
		EmailSubscribeRequest,
		EmailSubscribeAccepted,
		EmailSubscribeDenied,
		EmailSubscribeCancelled,
	} from '#lib/email/index.js'

	let { data } = $props()
</script>

<EmailSubscribeRequest {...data} />
<EmailSubscribeAccepted {...data} />
<EmailSubscribeDenied {...data} />
<EmailSubscribeCancelled {...data} />
