<script lang="ts">
  import type { GiftCondition } from "@prisma/client"
	import {InputSelect} from "$lib/material"
  import {conditionTypeOptions} from '$lib/validation'


  export let condition: Partial<GiftCondition>

</script>

<div>
  {condition.type} 
</div>