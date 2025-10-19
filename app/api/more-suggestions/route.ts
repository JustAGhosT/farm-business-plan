
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const province = searchParams.get('province')
  const town = searchParams.get('town')

  if (!province || !town) {
    return NextResponse.json({ error: 'Province and town are required' }, { status: 400 })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert in agriculture and crop planning. Provide a list of 5 crops that are suitable for growing in ${town}, ${province}. Return the list as a JSON array of strings.`,
        },
      ],
    })

    try {
      const crops = JSON.parse(completion.choices[0].message.content)
      return NextResponse.json({ crops })
    } catch (error) {
      console.error('Error parsing LLM response:', error)
      return NextResponse.json({ error: 'Invalid response from AI' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error fetching more crop suggestions:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
