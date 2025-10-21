import { query } from '@/lib/db'
import LocationStep from './LocationStep'

export const dynamic = 'force-dynamic'

async function getLocations() {
  // Skip database queries during build phase
  if (process.env.NEXT_PHASE === 'phase-production-build' || !process.env.DATABASE_URL) {
    console.log('Skipping database query during build phase')
    return []
  }

  try {
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
  } catch (error) {
    console.error('Error loading locations:', error)
    return []
  }
}

export default async function LocationPage() {
  const locations = await getLocations()
  return <LocationStep initialLocations={locations} />
}
