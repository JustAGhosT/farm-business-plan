import { NextResponse } from 'next/server'

// Example crop data
const crops = [
  { id: 'dragon-fruit', name: 'Dragon Fruit', category: 'Fruit', avgYield: '15-25 tons/hectare' },
  { id: 'moringa', name: 'Moringa', category: 'Leaf Vegetable', avgYield: '20-30 tons/hectare' },
  { id: 'lucerne', name: 'Lucerne', category: 'Forage', avgYield: '10-15 tons/hectare' },
]

export async function GET() {
  return NextResponse.json({
    success: true,
    data: crops,
    count: crops.length
  })
}
