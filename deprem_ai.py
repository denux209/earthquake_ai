# deprem_ai.py
import os
import PIL.Image
from google import generativeai as genai
from google.generativeai import types
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY")

if not API_KEY:
    raise ValueError("GOOGLE_API_KEY ortam değişkeni ayarlanmadı!")

genai.configure(api_key=API_KEY)

def backend(image_file):
    try:
        image = PIL.Image.open(image_file)

        model = genai.GenerativeModel('gemini-1.5-flash-latest')

        # Prompt
        prompt = """Bu resimdeki ortamda bir deprem olduğunu düşünelim.
        Bu depremden sağ kurtulabilmek için en güvenli bölgeleri belirle.
        Cevabını sadece şu formatta ver:
        Bölge1 (Pozisyon1)
        Bölge2 (Pozisyon2)
        Bölge3 (Pozisyon3)
        ...
        
        Açıklama yapma. Sadece listeyi ver."""

        # İçerik oluşturma isteği
        response = model.generate_content([prompt, image])

        print("API Yanıtı:", response.text)
        return response.text

    except types.generation_types.BlockedPromptException as e:
        print(f"API İsteği Engellendi: {e}")
        return "Güvenlik filtreleri nedeniyle içerik üretilemedi."
    except types.generation_types.StopCandidateException as e:
         print(f"API İsteği Durduruldu: {e}")
         return "İçerik üretimi beklenmedik şekilde durdu."
    except Exception as e:
        print(f"Beklenmedik bir hata oluştu: {e}")
        return f"Analiz sırasında bir hata oluştu: {type(e).__name__}"