import { query } from '@/lib/db'
import LocationStep from './LocationStep'

// ... (interfaces remain the same)

async function getLocations() {
  const { rows: provinces } = await query('SELECT id, name FROM provinces ORDER BY name')
  const { rows: towns } = await query('SELECT id, name, province_id FROM towns ORDER BY name')

  const townsByProvince = new Map()
  for (const town of towns) {
    if (!townsByProvince.has(town.province_id)) {
      townsByProvince.set(town.province_id, [])
    }
    townsByProvince.get(town.province_id).push(town)
  }

  return provinces.map((p) => ({
    ...p,
    towns: townsByProvince.get(p.id) || [],
  }))
}

export default async function LocationPage() {
  const locations = await getLocations()
  return <LocationStep initialLocations={locations} />
}
