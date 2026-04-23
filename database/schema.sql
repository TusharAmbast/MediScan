-- ─────────────────────────────────────────────────────────────
-- MediScan — Supabase Database Schema
-- Run this entire file in Supabase SQL Editor to set up tables
-- Supabase Dashboard → SQL Editor → Paste → Run
-- ─────────────────────────────────────────────────────────────


-- ── 1. Search History ──────────────────────────────────────────
-- Stores every medicine lookup so users can revisit past searches.
-- session_id is a random ID stored in the browser (no login needed).
CREATE TABLE IF NOT EXISTS search_history (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id      TEXT NOT NULL,
    medicine_name   TEXT NOT NULL,
    ocr_method      TEXT,                       -- "easyocr" or "trocr"
    ocr_confidence  FLOAT,                      -- 0.0 to 1.0
    language        TEXT DEFAULT 'en',
    found           BOOLEAN DEFAULT TRUE,       -- Did OpenFDA return a result?
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by session (most recent first)
CREATE INDEX IF NOT EXISTS idx_search_history_session
    ON search_history(session_id, created_at DESC);


-- ── 2. Symptom Mappings ────────────────────────────────────────
-- Local fallback table mapping common symptoms to medicines.
-- Used when OpenFDA symptom search returns nothing useful.
CREATE TABLE IF NOT EXISTS symptom_mappings (
    id              SERIAL PRIMARY KEY,
    symptom         TEXT NOT NULL,
    medicine_name   TEXT NOT NULL,
    category        TEXT,
    is_otc          BOOLEAN DEFAULT TRUE,       -- Over The Counter?
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_symptom_mappings_symptom
    ON symptom_mappings(symptom);


-- ── 3. Image Uploads ───────────────────────────────────────────
-- Tracks uploaded images stored in Supabase Storage bucket.
-- Useful for debugging OCR failures in production.
CREATE TABLE IF NOT EXISTS image_uploads (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id      TEXT NOT NULL,
    storage_path    TEXT NOT NULL,              -- Path in Supabase Storage
    ocr_result      TEXT,                       -- What OCR extracted
    ocr_confidence  FLOAT,
    processed       BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ─────────────────────────────────────────────────────────────
-- Seed Data: Common symptom → medicine mappings for Indian users
-- This acts as a local fallback when OpenFDA returns nothing
-- ─────────────────────────────────────────────────────────────
INSERT INTO symptom_mappings (symptom, medicine_name, category, is_otc) VALUES
    ('headache',            'Paracetamol',       'pain relief',   TRUE),
    ('fever',               'Paracetamol',       'fever',         TRUE),
    ('cold',                'Cetirizine',        'allergy/cold',  TRUE),
    ('cough',               'Dextromethorphan',  'cough',         TRUE),
    ('stomach pain',        'Pantoprazole',      'gastric',       TRUE),
    ('acidity',             'Omeprazole',        'gastric',       TRUE),
    ('loose motions',       'ORS',               'diarrhoea',     TRUE),
    ('diarrhoea',           'ORS',               'diarrhoea',     TRUE),
    ('muscle pain',         'Ibuprofen',         'pain relief',   TRUE),
    ('allergy',             'Cetirizine',        'allergy',       TRUE),
    ('skin rash',           'Hydrocortisone',    'skin',          TRUE),
    ('vomiting',            'Domperidone',       'nausea',        TRUE),
    ('nausea',              'Domperidone',       'nausea',        TRUE),
    ('infection',           'Amoxicillin',       'antibiotic',    FALSE),
    ('toothache',           'Ibuprofen',         'pain relief',   TRUE),
    ('back pain',           'Ibuprofen',         'pain relief',   TRUE),
    ('constipation',        'Lactulose',         'digestive',     TRUE),
    ('eye infection',       'Ciprofloxacin',     'eye drops',     FALSE),
    ('throat pain',         'Benzydamine',       'throat',        TRUE),
    ('high blood pressure', 'Amlodipine',        'cardiac',       FALSE)
ON CONFLICT DO NOTHING;