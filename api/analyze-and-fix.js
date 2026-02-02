// api/analyze-and-fix.js
// Анализ и исправление таблиц через OpenRouter AI

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }
    
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    // Промпт для анализа
    const prompt = `Проанализируй таблицу и найди ошибки:
${JSON.stringify(data, null, 2)}

Верни ТОЛЬКО JSON:
{
  "issues": [
    {"cell": "B3", "severity": "error", "description": "описание"}
  ],
  "changes": [
    {"cell": "B3", "before": "старое", "after": "новое", "reason": "причина"}
  ],
  "summary": "Найдено X проблем"
}`;
    
    // Вызов OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://your-domain.com',
        'X-Title': 'Sheets AI Helper'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error('OpenRouter API error');
    }
    
    const responseData = await response.json();
    const aiResponse = responseData.choices[0].message.content;
    
    // Парсим ответ
    let cleanResponse = aiResponse.trim();
    cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    const analysisData = JSON.parse(cleanResponse);
    
    return res.status(200).json({
      success: true,
      data: {
        issues: analysisData.issues || [],
        changes: analysisData.changes || [],
        summary: analysisData.summary || 'Анализ завершён'
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Ошибка анализа' 
    });
  }
}
