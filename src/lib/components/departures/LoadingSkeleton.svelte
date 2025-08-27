<script lang="ts">
  let { sections = 2, rows = 6 } = $props<{ sections?: number; rows?: number }>();
</script>

<div class="animate-pulse space-y-6" aria-hidden="true">
  {#each Array.from({ length: sections }) as _, i}
    <div class="space-y-3">
      <!-- Section header skeleton -->
      <div class="h-4 w-40 rounded bg-neutral-200/80 dark:bg-neutral-800"></div>

      <!-- Rows skeleton -->
      <ul class="divide-y divide-neutral-200/60 dark:divide-neutral-800/80">
        {#each Array.from({ length: rows }) as __, j}
          <li class="flex items-center justify-between py-2">
            <div class="flex items-center gap-3">
              <!-- Line pill skeleton -->
              <div class="h-6 w-10 rounded-full bg-neutral-200/80 dark:bg-neutral-800"></div>
              <!-- Destination text skeleton -->
              <div class="h-4 w-48 rounded bg-neutral-200/80 dark:bg-neutral-800"></div>
            </div>
            <div class="flex items-center gap-3">
              <!-- Time skeletons -->
              <div class="h-4 w-12 rounded bg-neutral-200/80 dark:bg-neutral-800"></div>
              <div class="h-4 w-10 rounded bg-neutral-200/80 dark:bg-neutral-800"></div>
            </div>
          </li>
        {/each}
      </ul>
    </div>
  {/each}
</div>
