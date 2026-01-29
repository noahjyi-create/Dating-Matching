import os
import numpy as np
import psycopg
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


# -----------------------------
# App + CORS (allow frontend)
# -----------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NLP model (downloads on first run)
model = SentenceTransformer("all-MiniLM-L6-v2")


# -----------------------------
# DB helpers
# -----------------------------
def get_conn():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise RuntimeError(
            "Missing DATABASE_URL.\n"
            "Example:\n"
            "export DATABASE_URL='postgresql://datemate_user:password@localhost:5432/dating'"
        )
    return psycopg.connect(db_url)


CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS profiles (
  profile_id BIGSERIAL PRIMARY KEY,
  dating_intent TEXT NOT NULL,
  gesture TEXT NOT NULL,
  passion TEXT NOT NULL,
  three_words TEXT NOT NULL,
  love_language TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
"""


@app.on_event("startup")
def startup():
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(CREATE_TABLE_SQL)
        conn.commit()


# -----------------------------
# Request model
# -----------------------------
class ProfileIn(BaseModel):
    dating_intent: str
    gesture: str = Field(min_length=1)
    passion: str = Field(min_length=1)
    three_words: str = Field(min_length=1)
    love_language: str


def build_profile_text(p: dict) -> str:
    return (
        f"Dating intent: {p['dating_intent']}. "
        f"Love language: {p['love_language']}. "
        f"Gesture: {p['gesture']}. "
        f"Passion: {p['passion']}. "
        f"Three words: {p['three_words']}."
    )


# -----------------------------
# Endpoints
# -----------------------------
@app.post("/profiles")
def create_profile(p: ProfileIn):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO profiles (dating_intent, gesture, passion, three_words, love_language)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING profile_id;
                """,
                (p.dating_intent, p.gesture, p.passion, p.three_words, p.love_language),
            )
            pid = cur.fetchone()[0]
        conn.commit()
    return {"profile_id": int(pid)}


@app.get("/profiles")
def list_profiles():
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT profile_id, dating_intent, gesture, passion, three_words, love_language, created_at
                FROM profiles
                ORDER BY profile_id ASC
            """)
            rows = cur.fetchall()

    return [
        {
            "profile_id": int(r[0]),
            "dating_intent": r[1],
            "gesture": r[2],
            "passion": r[3],
            "three_words": r[4],
            "love_language": r[5],
            "created_at": str(r[6]),
        }
        for r in rows
    ]


@app.get("/matches/{profile_id}")
def get_matches(profile_id: int, top_k: int = 5):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT profile_id, dating_intent, love_language, gesture, passion, three_words
                FROM profiles
                ORDER BY profile_id ASC
            """)
            rows = cur.fetchall()

    if len(rows) < 2:
        return []

    target = None
    candidates = []
    for r in rows:
        if int(r[0]) == profile_id:
            target = r
        else:
            candidates.append(r)

    if target is None:
        raise HTTPException(404, "profile_id not found")

    def row_to_dict(r):
        return {
            "dating_intent": r[1],
            "love_language": r[2],
            "gesture": r[3],
            "passion": r[4],
            "three_words": r[5],
        }

    texts = [build_profile_text(row_to_dict(target))] + [
        build_profile_text(row_to_dict(r)) for r in candidates
    ]

    emb = model.encode(texts, normalize_embeddings=True)
    sims = cosine_similarity(emb[0:1], emb[1:]).flatten()

    order = np.argsort(sims)[::-1][:top_k]
    results = []
    for idx in order:
        r = candidates[idx]
        results.append({
            "profile_id": int(r[0]),
            "similarity": float(sims[idx]),
        })
    return results

