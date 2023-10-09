<script lang="ts">

  export let href: string
  export let title: string
</script>

<a
  href={href}
  class="
    shadow hover:shadow-md transition-shadow
    bg-base-100 border rounded-lg p-6
  "
  >
  <li>
    <p class="font-medium mb-2">{title}</p>
    <slot/>
  </li>
</a>