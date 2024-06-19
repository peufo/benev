<script lang="ts">
	import { mdiTrashCanOutline } from '@mdi/js'
	import { Icon } from 'fuma'

	export let formaction: string
</script>

<button class="link link-hover text-xs flex gap-1 items-center" {formaction}>
	<Icon path={mdiTrashCanOutline} size={14} />
	<span>Supprimer</span>
</button>
