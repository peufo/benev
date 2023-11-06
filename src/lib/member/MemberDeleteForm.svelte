<script lang="ts">

	import { eventPath } from "$lib/store"
  import {DeleteButton} from '$lib/material'

  export let memberId: string
</script>
<form method="post" class="contents">
  <DeleteButton formaction="{$eventPath}/admin/members/{memberId}?member_delete" class="w-max">
    <slot>
      Supprimer l'adhésion à l'évenement
    </slot>
  </DeleteButton>
</form>