<script lang="ts">

  import MailNewSubscribe from "../../../[eventId]/teams/[teamId]/MailNewSubscribe.svelte";

  export let data
</script>

<MailNewSubscribe subscribe={data.subscribe} to="subscriber" />