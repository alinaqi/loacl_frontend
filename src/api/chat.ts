import OpenAI from 'openai';

interface ChatRequest {
  message: string;
  assistantId: string;
  openaiKey: string;
}

export async function handleChatRequest(req: ChatRequest): Promise<{ response: string }> {
  const { message, assistantId, openaiKey } = req;

  // Initialize OpenAI client
  const openai = new OpenAI({ apiKey: openaiKey });

  try {
    // Create a thread
    const thread = await openai.beta.threads.create();

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: message,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    // Wait for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    if (runStatus.status === 'completed') {
      // Get the assistant's response
      const messages = await openai.beta.threads.messages.list(thread.id);
      const lastMessage = messages.data[0];

      if (lastMessage.role === 'assistant') {
        return {
          response: lastMessage.content[0].text.value,
        };
      }
    }

    throw new Error('Failed to get response from assistant');
  } catch (error) {
    console.error('Error in chat request:', error);
    throw error;
  }
} 