export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const { messages, prompt } = req.body;
        // Support both messages array and single prompt
        const msgs = messages || (prompt ? [{ role: 'user', content: prompt }] : null);
        if (!msgs || !Array.isArray(msgs) || msgs.length === 0) {
            return res.status(400).json({ error: 'Missing messages or prompt' });
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: msgs,
                temperature: 0.3,
                max_tokens: 400
            })
        });

        if (!response.ok) {
            const status = response.status;
            if (status === 429) {
                return res.status(429).json({ error: 'Previse zahteva — sacekaj 30 sekundi.' });
            }
            return res.status(status).json({ error: 'Groq API greska (' + status + ')' });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (e) {
        return res.status(500).json({ error: 'Server greska: ' + e.message });
    }
}
