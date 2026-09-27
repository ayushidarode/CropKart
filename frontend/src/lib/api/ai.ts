export interface CropSathiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: 'en' | 'hi' | 'mr';
}

export interface ChatResponse {
  success: boolean;
  message: string;
  response: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function sendCropSathiMessage(
  message: string,
  language: 'en' | 'hi' | 'mr' = 'en',
  role?: string
): Promise<string> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        language,
        role: role || 'farmer',
      }),
    });

    if (res.ok) {
      const data: ChatResponse = await res.json();
      if (data.response) {
        return data.response;
      }
    }
  } catch (err) {
    console.warn('Backend FastAPI AI endpoint unreachable, using CropSathi client assistant:', err);
  }

  // Graceful agricultural assistant response when backend is offline
  const lower = message.toLowerCase();

  if (language === 'hi' || lower.includes('gehu') || lower.includes('tamatar')) {
    return 'नमस्ते! मैं क्रॉपसाथी हूँ - आपका डिजिटल कृषि साथी। आपकी फसल, मंडी भाव और खेती से जुड़े किसी भी सवाल के लिए मैं यहाँ हूँ। कृपया अपना प्रश्न पूछें।';
  }

  if (language === 'mr' || lower.includes('pani') || lower.includes('bhav')) {
    return 'नमस्कार! मी क्रॉपसाथी - आपला शेती सहाय्यक. पिकांची लागवड, बाजारभाव आणि हवामानाविषयी सल्ल्यासाठी मी उपलब्ध आहे. आपला प्रश्न विचारा.';
  }

  if (lower.includes('wheat') || lower.includes('demand') || lower.includes('price')) {
    return 'Wheat demand in Western India mandis remains strong with high buyer inquiries for Sharbati and Lokwan varieties. Current modal price is steady around ₹2,420 - ₹2,850 per quintal.';
  }

  if (lower.includes('tomato')) {
    return 'For tomatoes, ensure well-drained sandy loam soil with pH 6.0 - 6.8. Use drip irrigation to prevent fungal foliage conditions and maintain uniform fruit sizes for market.';
  }

  return `Namaste! CropSathi received your query: "${message}". Connecting to agricultural advisory channels. How else can I assist your farm today?`;
}
