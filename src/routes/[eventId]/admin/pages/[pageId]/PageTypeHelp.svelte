<script lang="ts">
	import { mdiHelpCircleOutline } from '@mdi/js'
	import { DropDown, Icon } from 'fuma'
	import { PAGE_TYPE } from '$lib/constant'
</script>

<DropDown tippyProps={{ trigger: 'mouseenter' }}>
	<button slot="activator" type="button" class="contents">
		<Icon path={mdiHelpCircleOutline} size={19} class="opacity-70 rotate-12 ml-2" />
	</button>
	<div class="p-4">
		<section>
			<h3 class="title-sm text-base flex items-center gap-2 mb-2">
				<Icon path={PAGE_TYPE.home.icon} size={20} class="fill-base-content/80" />
				<span>{PAGE_TYPE.home.label}</span>
			</h3>
			<p class="text-base-content/80">
				Page d'accueil du site unique et visible par tous le monde. Si elle est laissée vide, une
				page générique et basique est affichée par défaut.
			</p>
		</section>

		<div class="divider" />

		<section>
			<h3 class="title-sm text-base flex items-center gap-2 mb-2">
				<Icon path={PAGE_TYPE.charter.icon} size={20} class="fill-base-content/80" />
				<span>{PAGE_TYPE.charter.label}</span>
			</h3>
			<p class="text-base-content/80">
				Charte devant être accepté par les nouveaux membre lors de leur adhésion à l'évènement.
			</p>
		</section>

		<div class="divider" />

		<section>
			<h3 class="title-sm text-base flex items-center gap-2 mb-2">
				<Icon path={PAGE_TYPE.public.icon} size={20} class="fill-base-content/80" />
				<span>{PAGE_TYPE.public.label}</span>
			</h3>
			<p class="text-base-content/80">Page statique visible par tous le monde.</p>
		</section>

		<div class="divider" />

		<section>
			<h3 class="title-sm text-base flex items-center gap-2 mb-2">
				<Icon path={PAGE_TYPE.member.icon} size={20} class="fill-base-content/80" />
				<span>{PAGE_TYPE.member.label}</span>
			</h3>
			<p class="text-base-content/80">
				Visible par les membres uniquement. Tu peux y injecter dynamiquement des informations lié
				aux profils.
			</p>
		</section>
	</div>
</DropDown>
