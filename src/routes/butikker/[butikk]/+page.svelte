
<script lang="ts">
    import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "$lib/components/ui/table";
    const { data }= $props();
    const { storeData } = data;
    
</script>

<main class=" px-5 pt-10 flex flex-col gap-10">
   
        <h1 class="scroll-m-20 text-balance text-4xl font-extrabold tracking-tight">
            {storeData.name}
        </h1>

        <div>
            <Table class="w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead>Dag</TableHead>
                        <TableHead>Åpner</TableHead>
                        <TableHead>Stenger</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {#each storeData.openingHours as openingHour}
                        <TableRow>
                            <TableCell>{openingHour.day}</TableCell>
                            <TableCell>{openingHour.open || "Stengt"}</TableCell>
                            <TableCell>{openingHour.close || "Stengt"}</TableCell>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>
        </div>
        <div>
            <p class="scroll-m-20 text-xl font-semibold tracking-tight">Kontaktinformasjon</p>
        <ul class="my-6 ml-6 list-disc [&>li]:mt-2">
            <li>Adresse: {storeData.address.street}, {storeData.address.zip} {storeData.address.city}</li>
             <li>Telefon: {storeData.contact.phone}</li>
             {#if storeData.contact.email}
                <li>E-post: {storeData.contact.email}</li>
             {/if}
            {#if storeData.contact.url}
                <li>Nettsted: {storeData.contact.url}</li>
            {/if}
        </ul>
        </div>
    
</main>
