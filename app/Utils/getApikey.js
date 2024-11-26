export const getOpenAIKey = () => {
    if (typeof window !== 'undefined') {
      const localKey = localStorage.getItem('openAIKey');
      if (localKey && localKey.startsWith('sk-')) {
        return localKey;
      }
    }
    return  '';
  };
  
  export const getAnthropicKey = () => {
    if (typeof window !== 'undefined') {
      const localKey = localStorage.getItem('anthropicKey');
      if (localKey && localKey.startsWith('sk-')) {
        return localKey;
      }
    }
    return '';
  };