export interface LlmProvider {
  generateSuggestions(prompt: string): Promise<string[]>;
}

export async function generateSuggestions(
  provider: LlmProvider,
  prompt: string
): Promise<string[]> {
  return provider.generateSuggestions(prompt);
}

// Lazy load OpenAI only when needed
let OpenAI: any;
let openai: any;

async function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  if (!OpenAI) {
    OpenAI = (await import('openai')).default;
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return openai;
}

export class OpenAIProvider implements LlmProvider {
  async generateSuggestions(prompt: string): Promise<string[]> {
    const client = await getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: prompt,
        },
      ],
    });

    try {
      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      throw new Error('Invalid response from AI');
    }
  }
}

// Lazy load Anthropic only when needed
let Anthropic: any;
let anthropic: any;

async function getAnthropicClient() {
  if (!process.env.CLAUDE_API_KEY) {
    throw new Error('Claude API key is not configured');
  }

  if (!Anthropic) {
    Anthropic = (await import('@anthropic-ai/sdk')).default;
    anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });
  }

  return anthropic;
}

export class ClaudeProvider implements LlmProvider {
  async generateSuggestions(prompt: string): Promise<string[]> {
    const client = await getAnthropicClient();
    const completion = await client.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    try {
      return JSON.parse(completion.content[0].text);
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      throw new Error('Invalid response from AI');
    }
  }
}

// Lazy load Groq only when needed
let Groq: any;
let groq: any;

async function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('Groq API key is not configured');
  }

  if (!Groq) {
    Groq = (await import('groq-sdk')).default;
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  return groq;
}

export class GroqProvider implements LlmProvider {
  async generateSuggestions(prompt: string): Promise<string[]> {
    const client = await getGroqClient();
    const completion = await client.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: prompt,
        },
      ],
    });

    try {
      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      throw new Error('Invalid response from AI');
    }
  }
}

// Lazy load Azure OpenAI only when needed
let AzureOpenAI: any;
let azureOpenai: any;

async function getAzureOpenAIClient() {
  if (!process.env.AZURE_OPENAI_API_KEY || !process.env.AZURE_OPENAI_ENDPOINT) {
    throw new Error('Azure OpenAI API key or endpoint is not configured');
  }

  if (!AzureOpenAI) {
    AzureOpenAI = (await import('openai')).default;
    azureOpenai = new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    });
  }

  return azureOpenai;
}

export class AzureOpenAIProvider implements LlmProvider {
  async generateSuggestions(prompt: string): Promise<string[]> {
    const client = await getAzureOpenAIClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: prompt,
        },
      ],
    });

    try {
      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      throw new Error('Invalid response from AI');
    }
  }
}
