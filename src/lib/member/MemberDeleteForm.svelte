<script lang="ts">

	import { eventPath } from "$lib/store"
  import {DeleteButton} from '$lib/material'
	import { useForm } from "$lib/form"
	import { enhance } from "$app/forms"

  export let memberId: string
  export let redirectTo = '/me'

  const form = useForm({
    successMessage: 'Adhésion supprimée'
  })

</script>

<form method="post" class="contents" use:enhance={form.submit}>
  <input type="hidden" name="memberId" value={memberId}>
  <input type="hidden" name="redirectTo" value={redirectTo}>
  <DeleteButton formaction="{$eventPath}/api/members?/delete_member" class="w-max">
    <slot>
      Supprimer l'adhésion à l'évenement
    </slot>
  </DeleteButton>
</form>