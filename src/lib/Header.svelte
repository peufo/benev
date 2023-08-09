<script lang="ts">
	import { mdiAccountOutline, mdiHomeOutline } from '@mdi/js'
	import Icon from '$lib/material/Icon.svelte'

	export let userName = ''


</script>

<header class="navbar rounded-2xl bg-base-100 shadow-xl">
  <div class="gap-2" >

    <a class="btn-ghost text-lg btn btn-square lg:inline-flex lg:w-auto lg:px-2" href="/">
      <Icon  path={mdiHomeOutline} class=lg:hidden/>
      <span class="hidden lg:inline-block">BENEV</span>
    </a>

    <slot name="start"/>
  </div>
  <div class="grow"></div>
  <div >
    <slot name="end"/>

    <a class="btn-ghost rounded-btn btn btn-square lg:inline-flex lg:w-auto lg:px-2" href="/auth">
      <Icon path={mdiAccountOutline} />
      <span class="hidden lg:block">{userName || ''}</span>
    </a>
  
  </div>
</header>