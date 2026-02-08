
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
}

export const getStylistAdvice = async (history: { role: 'user' | 'assistant', content: string }[], availableProducts: Product[]) => {
    const productsList = availableProducts.map(p => `${p.name} (${p.category})`).join(', ');

    const systemPrompt = `
    You are a professional fashion stylist and close friend. You give real, honest fashion advice - NOT a salesperson.
    
    Instructions:
    1. Keep your response VERY SHORT (max 1-2 sentences).
    2. Give GENERAL fashion advice about colors, styles, fits, trends - don't focus on any specific store.
    3. Talk about fashion in general - what looks good, what's trending, what suits different body types, occasions, etc.
    4. Be a REAL stylist friend, not a store sales assistant.
    5. Tone: Super casual, slangy, close friend. "Bro," "Dude," "Bestie" vibes. Be real, not robotic.
    6. Language: MATCH THE USER. If they speak English, reply in English. If they speak Hinglish (Hindi + English), reply in Hinglish! (e.g., "Ye look mast lagega!", "Bhai, ye try kar").
    
    STORE INVENTORY (ONLY for bonus mention):
    ${productsList}
    
    IMPORTANT: Only at the END of your response, IF your suggestion happens to match something in the store inventory above, you can casually add "btw we have this too!" or "yahan bhi available hai!". But NEVER force store products. If nothing matches, don't mention store at all.
  `;

    try {
        const messages = [
            { role: 'system', content: systemPrompt },
            ...history
        ];

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: messages,
                temperature: 0.7,
                max_tokens: 150
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch AI response');
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "Sorry, I'm having trouble connecting to the stylist server right now.";
    } catch (error) {
        console.error('Groq API Error:', error);
        return "I couldn't reach the stylist. Please try again in a moment.";
    }
};
