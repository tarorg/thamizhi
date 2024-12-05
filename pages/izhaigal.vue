<template>
  <div class="container mx-auto p-8">
    <div class="m-10">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-3xl font-bold">இழைகள்</h1>
        <button @click="navigateToAddPage" class="text-blue-500 ml-4">
          <PlusCircle class="w-8 h-8" />
        </button>
      </div>
      <div v-if="isLoading" class="text-center">Loading...</div>
      <div v-else-if="error" class="text-red-500 text-center">{{ error }}</div>
      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr class="bg-gray-100">
                <th class="py-2 px-4 text-left font-medium">Thumbnail</th>
                <th class="py-2 px-4 text-left font-medium">Section</th>
                <th class="py-2 px-4 text-left font-medium">Collection</th>
                <th class="py-2 px-4 text-left font-medium">Thread</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50 transition-colors">
                <td class="py-2 px-4">
                  <img :src="item.thumbnail" alt="Thumbnail" class="w-16 h-16 object-cover rounded-md" />
                </td>
                <td class="py-2 px-4">{{ item.section }}</td>
                <td class="py-2 px-4">{{ item.collection }}</td>
                <td class="py-2 px-4">{{ item.thread }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-4 flex justify-end">
          <button class="px-4 py-2 bg-blue-500 text-white rounded-md">Previous</button>
          <button class="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PlusCircle } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToAddPage = () => {
  router.push('/izhai')
}

interface IzhaiItem {
  id: number
  thumbnail: string
  section: string
  collection: string
  thread: string
  createdat: string
  updatedat: string
}

const items = ref<IzhaiItem[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const fetchIzhaiData = async () => {
  try {
    isLoading.value = true
    error.value = null

    const response = await fetch('https://thamizhi-thamizhiorg.turso.io/v2/pipeline', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MzI2OTU0NDMsImlkIjoiNDMyNTdlMTMtZjViMC00ZmY0LWE1Y2QtNDFlMDJjYTBjOWU0In0.Z4Q-D3LX9bZ_VAo6sgnZSeC2d_ghWfHzBbpinio56MCJKL7bpGtWVmSrrU5DJaE2n0ONY1_PO9Lh1OzS6pFGAA',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [{
          type: "execute",
          stmt: {
            sql: "SELECT * FROM izhai ORDER BY createdat DESC",
            args: []
          }
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    const rows = result?.results?.[0]?.response?.result?.rows || []
    items.value = rows.map((row: any) => ({
      id: row[0]?.value,
      thumbnail: row[1]?.value,
      section: row[2]?.value,
      collection: row[3]?.value,
      thread: row[4]?.value,
      createdat: row[5]?.value,
      updatedat: row[6]?.value
    }))
  } catch (err) {
    console.error('Failed to fetch data:', err)
    error.value = 'Failed to load content'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchIzhaiData)
</script>

<style scoped>
table {
  border-collapse: collapse;
  width: 100%;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f0f0f0;
}
</style>
