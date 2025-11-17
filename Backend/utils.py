from transformers import pipeline
from functools import cache
import re

@cache
def load_emotion_analyzer():
    """
    Loads and caches the emotion model only once.
    Heavy operation → solved with functools.cache.
    """
    return pipeline(
        "sentiment-analysis",
        model="j-hartmann/emotion-english-distilroberta-base"
    )

CRISIS_PATTERNS = [
    r"kill myself",
    r"end my life",
    r"suicid(e|al)",
    r"self harm",
    r"cut myself",
    r"can't go on",
    r"don'?t want to live",
    r"life is meaningless",
    r"dying",
    r"end it all"
]

MILD_DISTRESS_TERMS = [
    "depressed", "anxious", "panic", "alone", "hopeless",
    "empty", "lost", "sad", "overwhelmed", "stress"
]

IRRELEVANT_TOPICS = [
    "recipe", "cook", "dish", "food", "bake", "ingredients",
    "code", "program", "python", "java", "math",
    "music", "movie", "sport", "travel",
    "game", "history", "science", "weather",
]

def is_irrelevant_query(text: str) -> bool:
    t = text.lower()
    return any(word in t for word in IRRELEVANT_TOPICS)

def detect_distress(text: str) -> bool:
    t = text.lower()

    # High-risk crisis phrases
    for pattern in CRISIS_PATTERNS:
        if re.search(pattern, t):
            return True  # Trigger crisis mode

    return False  # Mild distress → not crisis

def detect_emotion(text: str) -> str:
    try:
        result = load_emotion_analyzer(text)
        return result[0]["label"].lower()
    except Exception:
        return "neutral"
