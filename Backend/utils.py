from transformers import pipeline

emotion_analyzer = pipeline("sentiment-analysis",
                            model="j-hartmann/emotion-english-distilroberta-base")

DISTRESS_KEYWORDS = [
    "hopeless", "suicide", "self harm", "can't go on", "kill myself",
    "end it", "life is meaningless", "depressed", "panic", "anxious", "alone"
]

def detect_emotion(text: str) -> str:
    try:
        result = emotion_analyzer(text)[0]
        return result["label"].lower()
    except Exception:
        return "neutral"

def detect_distress(text: str) -> bool:
    return any(word in text.lower() for word in DISTRESS_KEYWORDS)
