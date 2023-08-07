<script lang="ts">

  import MailNewSubscribe from "../../../[eventId]/teams/[teamId]/MailNewSubscribe.svelte";
  import MailSubscribeState from "../../../[eventId]/teams/[teamId]/MailSubscribeState.svelte";

  export let data
</script>

<MailNewSubscribe subscribe={data.subscribe} />

<MailSubscribeState subscribe={data.subscribe}/>