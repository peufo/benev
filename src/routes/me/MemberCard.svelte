<script lang="ts">
	import type { PageData } from "./$types"
	import MemberRole from "$lib/MemberRole.svelte"
	import { eventStates } from "$lib/form"
	import { CardLink, Icon } from "$lib/material"

  export let member: PageData['members'][number]

  $: nbSubscribes = member.subscribes.length
  $: nbLeaderOf = member.leaderOf.length

</script>

<CardLink href="/{member.eventId}/me">
  <div slot="title" class="flex gap-2 items-center flex-wrap">
    {#if member.event.logo}
      <img src={member.event.logo} alt="logo de {member.event.name}" class="w-7 inline-block" />
    {/if}
    <span>{member.event.name}</span>
    
    {#if member.event.state !== 'active'}
      <Icon
        class="opacity-70 z-10 {member.event.state === 'draft' ? 'rotate-12' : ''}"
        size={20}
        path={eventStates[member.event.state].icon}
        title={eventStates[member.event.state].label}
      />
    {/if}

    <MemberRole roles={member.roles} class="ml-auto" />
  </div>

  <div class="flex gap-2 mt-4">
    <div class="badge">
      {#if nbSubscribes}
        <b class="mr-1 opacity-80">{nbSubscribes}</b>
        <span>Inscription{nbSubscribes > 1 ? 's' : ''}</span>
      {:else}
        <span>Pas d'inscription</span>
      {/if}
    </div>

    {#if nbLeaderOf}
      <div class="badge">
        <b class="mr-1 opacity-80">{nbLeaderOf}</b>
        <span>Secteur{nbLeaderOf > 1 ? 's' : ''} à charge</span>
      </div>
    {/if}
  </div>
</CardLink>