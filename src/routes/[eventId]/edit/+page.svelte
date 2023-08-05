<script lang="ts">
	import EventForm from '../../EventForm.svelte'


  export let data

</script>

<EventForm isUpdate event={data.event} />