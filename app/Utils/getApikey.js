export const getOpenAIKey = () => {
    if (typeof window !== 'undefined') {
      const localKey = localStorage.getItem('openAIKey');
      if (localKey && localKey.startsWith('sk-')) {
        return localKey;
      }
    }
    return process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
  };
  
  export const getAnthropicKey = () => {
    if (typeof window !== 'undefined') {
      const localKey = localStorage.getItem('anthropicKey');
      if (localKey && localKey.startsWith('sk-')) {
        return localKey;
      }
    }
    return process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '';
  };