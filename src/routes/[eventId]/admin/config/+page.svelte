<script lang="ts">
	import { SectionCollapse } from '$lib/material'
	import EventForm from '$lib/EventForm.svelte'
	import Share from './Share.svelte'
	import MemberFields from '$lib/member/MemberFields.svelte'

	export let data
</script>

<div class="grid gap-6 place-content-center justify-stretch pb-36 px-0 md:px-20 lg:px-48">
	<SectionCollapse value="infos" class="grow">
		<span slot="title">Informations de base</span>
		<EventForm isUpdate successReset={false} event={data.event} class="grow" />
	</SectionCollapse>

	<SectionCollapse value="share">
		<span slot="title">Partage</span>
		<Share />
	</SectionCollapse>

	<MemberFields fields={data.memberFields} />
</div>
