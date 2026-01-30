<script lang="ts">
	import { MEMBER_FIELD_TYPE } from '$lib/constant'
	import { mdiPencilOutline } from '@mdi/js'
	import type { Field } from '@prisma/client'
	import { Icon, urlParam } from 'fuma'

	export let field: Field
	export let updateLink = false
</script>

<div class="flex gap-2 items-center">
	<Icon path={MEMBER_FIELD_TYPE[field.type].icon} class="opacity-70" />
	<span>
		{field.name}
	</span>
	{#if updateLink}
		<a href={$urlParam.with({ form_field: field.id })} class="btn btn-square btn-sm ml-auto">
			<Icon path={mdiPencilOutline} title="Éditer le champ" />
		</a>
	{/if}
</div>
