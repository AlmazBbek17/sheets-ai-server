// api/generate-formula.js
// Генерация формул через OpenRouter AI

export default async function handler(req, res) {
  // CORS для Chrome расширения
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
    const { request } = req.body;
    
    if (!request) {
      return res.status(400).json({ error: 'Request is required' });
    }
    
    // Ваш API ключ OpenRouter (из переменных окружения)
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    // Промпт для ИИ
    const prompt = `Ты эксперт по Google Sheets. Пользователь просит: "${request}"

Верни ТОЛЬКО JSON (без markdown, без текста до или после):
{
  "formula": "=ФОРМУЛА",
  "explanation": "простое объяснение",
  "type": "single-cell или row-by-row или array",
  "targetCell": "C2",
  "autofill": true или false
}

Примеры:
"Посчитай сумму в столбце A" → {"formula": "=SUM(A:A)", "type": "single-cell", "autofill": false, ...}
"Добавь НДС 20%" → {"formula": "=B2*0.2", "type": "row-by-row", "autofill": true, ...}`;
    
    // Вызов OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://your-domain.com',
        'X-Title': 'Sheets AI Helper'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet', // Или другая модель
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
    
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Парсим JSON ответ
    let cleanResponse = aiResponse.trim();
    cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    const formulaData = JSON.parse(cleanResponse);
    
    return res.status(200).json({
      success: true,
      data: {
        formula: formulaData.formula,
        explanation: formulaData.explanation || 'Формула создана',
        type: formulaData.type || 'single-cell',
        targetCell: formulaData.targetCell || 'C2',
        autofill: formulaData.autofill || false
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Ошибка генерации формулы' 
    });
  }
}
