// AI Service for Frost AI with smart responses
export const sendToAI = async (message, language = 'en', style = 'professional') => {
  try {
    // Smart response patterns
    const responses = {
      en: {
        professional: [
          `Based on your question about "${message}", I recommend a strategic approach to address this effectively.`,
          `Thank you for asking about "${message}". Here's my professional analysis and recommendation.`,
          `Regarding "${message}", I suggest focusing on key objectives and measurable outcomes.`
        ],
        friendly: [
          `Great question about "${message}"! I'm happy to help you with this.`,
          `Thanks for asking about "${message}"! Here's what I think would work best for you.`,
          `That's interesting! About "${message}" - I'd love to share some insights with you.`
        ],
        casual: [
          `Cool question about "${message}"! Here's what I'd do in your situation.`,
          `So you're asking about "${message}"? No worries, I got you covered!`,
          `Got it! About "${message}" - here's my take on it.`
        ]
      }
    };

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const langResponses = responses[language] || responses.en;
    const styleResponses = langResponses[style] || langResponses.professional;
    const randomResponse = styleResponses[Math.floor(Math.random() * styleResponses.length)];

    return {
      success: true,
      message: randomResponse
    };
  } catch (error) {
    return {
      success: false,
      message: "I'm here to help! What can I do for you?"
    };
  }
};