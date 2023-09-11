<script lang="ts">
	import { EmailNewSubscribe, EmailSubscribeState } from '$lib/email'

	export let data
</script>

<EmailNewSubscribe subscribe={data.subscribe}  />
<EmailNewSubscribe subscribe={data.subscribe} author={{ firstName: 'Jean', lastName: 'Valjean'}} />

<EmailSubscribeState subscribe={data.subscribe} />
