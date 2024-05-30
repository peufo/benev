<script lang="ts">
	import { Icon } from 'fuma'
	import { mdiAlertBoxOutline } from '@mdi/js'
</script>

<div class="bg-base-300/50 p-4 rounded-box opacity-60">
	<div class="text-sm flex items-center gap-2">
		<Icon path={mdiAlertBoxOutline} />
		Zone en développement
	</div>

	<slot />
</div>
