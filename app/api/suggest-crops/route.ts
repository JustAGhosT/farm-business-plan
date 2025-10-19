import { NextResponse } from 'next/server'

// In a real application, this data would come from a database or a more sophisticated crop suggestion engine.
const cropSuggestions = {
  Limpopo: {
    Bela_Bela: ['Dragon Fruit', 'Moringa', 'Lucerne'],
    Polokwane: ['Maize', 'Sorghum', 'Sunflowers'],
    Mokopane: ['Citrus', 'Avocado', 'Macadamia'],
  },
  Gauteng: {
    Johannesburg: ['Tomatoes', 'Cucumbers', 'Peppers'],
    Pretoria: ['Lettuce', 'Spinach', 'Kale'],
    Soweto: ['Potatoes', 'Onions', 'Carrots'],
  },
  'Western Cape': {
    'Cape Town': ['Grapes', 'Olives', 'Wheat'],
    Stellenbosch: ['Apples', 'Pears', 'Berries'],
    George: ['Hops', 'Barley', 'Canola'],
  },
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const province = searchParams.get('province')
  const town = searchParams.get('town')

  if (!province || !town) {
    return NextResponse.json({ error: 'Province and town are required' }, { status: 400 })
  }

  const suggestions = cropSuggestions[province]?.[town] || []

  return NextResponse.json({ crops: suggestions })
}
