import { cropRepository } from '@/lib/repositories/cropRepository';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const province = searchParams.get('province');
  const town = searchParams.get('town');

  try {
    const suggestions = await cropRepository.getSuggestions(province, town);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching crop suggestions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
