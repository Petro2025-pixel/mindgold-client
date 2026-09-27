/**
 * Ready-made prompts for generating quiz JSON via external AI.
 *
 * Six variants: 3 languages × 2 source types.
 *   - text:       user types a topic / pastes text → AI generates quiz
 *   - screenshot: user attaches an image → vision AI extracts + generates quiz
 *
 * Prompts are copied to the clipboard from the Import JSON tab.
 * Placeholders in {{UPPERCASE}} are filled in automatically by the frontend
 * (Topic, Count, Prefix, Language, Level) before copying — the user just
 * pastes the final prompt into ChatGPT / Claude / Gemini.
 *
 * IMPORTANT — keep in sync with backend `quizSchema.js` (AJV):
 *   - `correct` (NOT `correctAnswer`) — integer 0–3
 *   - `answers` — 2–4 non-empty strings
 *   - `hint` — required (used by CheatSheet learning mode)
 *   - `tags` — AI generates from topic
 *   - `category` — NOT part of the prompt (user selects it in the UI)
 *
 * The [CRITICAL: ...] prefix and === FINAL REMINDER === suffix are
 * intentionally aggressive: many models (Gemini Flash in particular)
 * tend to render quizzes as interactive widgets or wrap output in
 * markdown fences. These banners push them toward plain JSON text.
 */

export const PROMPTS = {
  // ═══════════════════════════════════════════════════════════════════
  //  TEXT prompts — user types a topic / pastes text
  // ═══════════════════════════════════════════════════════════════════
  text: {
    // ─── English ─────────────────────────────────────────────────
    en: `[CRITICAL: Output ONLY raw JSON text — no widgets, no artifacts, no UI, no interactive elements, no markdown fences, no explanations. Just a plain text JSON object.]

You are a quiz generator for MindGold — an interactive quiz and knowledge engine.

Your task is to produce a quiz JSON file strictly following the schema below.

=== JSON SCHEMA ===

{
  "quizTitle": "Quiz title",
  "tags": ["tag1", "tag2"],
  "questions": [
    {
      "id": "PRFX-001",
      "question": "Question text?",
      "answers": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "hint": "Brief explanation (1–3 sentences) of why the answer is correct."
    }
  ]
}

=== RULES ===

FORMAT
Output ONLY valid JSON — no preamble, no explanations, no markdown code fences.
The first character must be {, the last character must be }.
Use UTF-8 and double quotes for all strings.

TAGS FIELD
1–4 short lowercase tags summarizing the quiz topic (e.g. ["csharp", "basics", "linq"]).

ID FIELD
Format: PRFX-NNN, where PRFX is a 4-letter uppercase code for the topic
and NNN is a zero-padded sequential number.
Example: "Rektion der Verben" → REKT-001, REKT-002, ...

QUESTION FIELD
Clear, unambiguous phrasing. No duplicate questions.

ANSWERS FIELD
Array of 2–4 plausible answer options.
Randomize the position of the correct answer across indices (0, 1, 2, 3).

CORRECT FIELD
Integer from 0 to 3.
Zero-based index of the correct answer inside the "answers" array.

HINT FIELD (REQUIRED)
1–3 sentences explaining WHY the answer is correct.
This is used for the CheatSheet learning mode — be clear and educational.
Do NOT omit this field.

=== YOUR TASK ===

Topic: {{TOPIC}}
Number of questions: {{COUNT}}
Language of questions and answers: {{LANGUAGE}}
Level: {{LEVEL}}
ID prefix (4 uppercase letters): {{PREFIX}}

=== FINAL REMINDER ===
Return the quiz as raw JSON text in the chat.
DO NOT create a widget, artifact, or interactive quiz.
DO NOT wrap in \`\`\`json fences.
First character: {
Last character: }`,

    // ─── German ──────────────────────────────────────────────────
    de: `[KRITISCH: Gib NUR reines JSON aus — keine Widgets, keine Artefakte, keine UI, keine interaktiven Elemente, keine Markdown-Fences, keine Erklärungen. Nur ein einfaches Text-JSON-Objekt.]

Du bist ein Quiz-Generator für MindGold — eine interaktive Quiz- und Wissensengine.

Deine Aufgabe ist es, eine Quiz-JSON-Datei streng nach dem folgenden Schema zu erstellen.

=== JSON-SCHEMA ===

{
  "quizTitle": "Titel des Quiz",
  "tags": ["tag1", "tag2"],
  "questions": [
    {
      "id": "PRFX-001",
      "question": "Fragetext?",
      "answers": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "hint": "Kurze Erklärung (1–3 Sätze), warum die Antwort richtig ist."
    }
  ]
}

=== REGELN ===

FORMAT
Gib AUSSCHLIESSLICH gültiges JSON aus — keine Einleitung, keine Erklärungen, keine Markdown-Codeblöcke.
Das erste Zeichen muss { sein, das letzte }.
Verwende UTF-8 und doppelte Anführungszeichen für alle Strings.

TAGS-FELD
1–4 kurze Tags in Kleinbuchstaben, die das Quizthema zusammenfassen (z.B. ["csharp", "grundlagen", "linq"]).

ID-FELD
Format: PRFX-NNN, wobei PRFX ein 4-Buchstaben-Code in Großbuchstaben für das Thema ist
und NNN eine fortlaufende Nummer mit führenden Nullen.
Beispiel: "Rektion der Verben" → REKT-001, REKT-002, ...

QUESTION-FELD
Klare, eindeutige Formulierung. Keine doppelten Fragen.

ANSWERS-FELD
Array mit 2–4 plausiblen Antwortoptionen.
Verteile die richtige Antwort zufällig auf die Indizes (0, 1, 2, 3).

CORRECT-FELD
Ganzzahl von 0 bis 3.
Nullbasierter Index der richtigen Antwort im "answers"-Array.

HINT-FELD (ERFORDERLICH)
1–3 Sätze, die erklären, WARUM die Antwort richtig ist.
Wird für den CheatSheet-Lernmodus verwendet — klar und lehrreich formulieren.
Dieses Feld NICHT weglassen.

=== DEINE AUFGABE ===

Thema: {{TOPIC}}
Anzahl der Fragen: {{COUNT}}
Sprache der Fragen und Antworten: {{LANGUAGE}}
Niveau: {{LEVEL}}
ID-Präfix (4 Großbuchstaben): {{PREFIX}}

=== LETZTE ERINNERUNG ===
Gib das Quiz als reinen JSON-Text im Chat zurück.
Erstelle KEIN Widget, KEIN Artefakt und KEIN interaktives Quiz.
Verpacke nicht in \`\`\`json-Fences.
Erstes Zeichen: {
Letztes Zeichen: }`,

    // ─── Ukrainian ───────────────────────────────────────────────
    uk: `[КРИТИЧНО: Виводь ТІЛЬКИ чистий JSON — без віджетів, без артефактів, без UI, без інтерактивних елементів, без markdown-обгорток, без пояснень. Лише простий текстовий JSON-об'єкт.]

Ти — генератор квізів для MindGold — інтерактивного рушія квізів та знань.

Твоє завдання — створити JSON-файл квіза чітко за наведеною схемою.

=== СХЕМА JSON ===

{
  "quizTitle": "Назва квіза",
  "tags": ["тег1", "тег2"],
  "questions": [
    {
      "id": "PRFX-001",
      "question": "Текст запитання?",
      "answers": ["Варіант A", "Варіант B", "Варіант C", "Варіант D"],
      "correct": 0,
      "hint": "Коротке пояснення (1–3 речення), чому відповідь правильна."
    }
  ]
}

=== ПРАВИЛА ===

ФОРМАТ
Виводь ВИКЛЮЧНО валідний JSON — без вступу, без пояснень, без markdown-блоків.
Перший символ — {, останній — }.
Кодування UTF-8, подвійні лапки для всіх рядків.

ПОЛЕ TAGS
1–4 короткі теги малими літерами, що описують тему квіза (напр. ["csharp", "основи", "linq"]).

ПОЛЕ ID
Формат: PRFX-NNN, де PRFX — 4 великі літери теми,
NNN — порядковий номер із провідними нулями.
Приклад: "Rektion der Verben" → REKT-001, REKT-002, ...

ПОЛЕ QUESTION
Чітке, однозначне формулювання. Без дублікатів питань.

ПОЛЕ ANSWERS
Масив від 2 до 4 правдоподібних варіантів відповіді.
Розподіляй правильну відповідь випадково за індексами (0, 1, 2, 3).

ПОЛЕ CORRECT
Ціле число від 0 до 3.
Індекс правильної відповіді в масиві "answers" (0 = перша).

ПОЛЕ HINT (ОБОВ'ЯЗКОВЕ)
1–3 речення, що пояснюють, ЧОМУ відповідь правильна.
Використовується в режимі навчання CheatSheet — формулюй чітко та повчально.
НЕ пропускай це поле.

=== ТВОЄ ЗАВДАННЯ ===

Тема: {{TOPIC}}
Кількість питань: {{COUNT}}
Мова питань і відповідей: {{LANGUAGE}}
Рівень: {{LEVEL}}
Префікс ID (4 великі літери): {{PREFIX}}

=== ОСТАННЄ НАГАДУВАННЯ ===
Поверни квіз як чистий текст JSON у чаті.
НЕ створюй віджет, артефакт чи інтерактивний квіз.
Не обгортай у \`\`\`json.
Перший символ: {
Останній символ: }`,
  },

  // ═══════════════════════════════════════════════════════════════════
  //  SCREENSHOT prompts — user attaches an image (vision AI)
  // ═══════════════════════════════════════════════════════════════════
  screenshot: {
    // ─── English ─────────────────────────────────────────────────
    en: `[CRITICAL: Output ONLY raw JSON text — no widgets, no artifacts, no UI, no interactive elements, no markdown fences, no explanations. Just a plain text JSON object.]

You are a vision AI assistant for MindGold — an interactive quiz and knowledge engine.

You will receive an image. It may contain:
- a screenshot of a quiz or test
- a photo of a textbook page or study notes
- a list of questions and answers
- a topic outline

Follow the two steps below.

=== STEP 1 — EXTRACT ===

Read all text from the image. Identify:
- Question text (or topic headings if only a topic is shown)
- Answer options (if present)
- Which answer is marked correct (if indicated)
- Any level markers (A1, A2, B1, B2, C1, C2) or subject hints

=== STEP 2 — GENERATE QUIZ JSON ===

Convert the extracted content into a quiz strictly following the schema below.

{
  "quizTitle": "Quiz title",
  "tags": ["tag1", "tag2"],
  "questions": [
    {
      "id": "PRFX-001",
      "question": "Question text?",
      "answers": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "hint": "Brief explanation (1–3 sentences) of why the answer is correct."
    }
  ]
}

=== RULES ===

FORMAT
Output ONLY valid JSON — no preamble, no explanations, no markdown code fences.
First character {, last character }.

CONTENT SOURCE
- If the image contains complete questions → extract them AS-IS (preserve wording).
- If the image contains only a topic name or outline → generate 10 quiz questions on that topic.
- Do NOT invent facts that contradict the image.

TAGS FIELD
1–4 short lowercase tags summarizing the topic (e.g. ["german", "b1", "grammar"]).

ID FIELD
Format: PRFX-NNN (4-letter uppercase prefix + zero-padded number).
Example: BILD-001, BILD-002, ...

ANSWERS FIELD
Array of 2–4 plausible options. Randomize the correct answer position.

CORRECT FIELD
Integer 0–3 — index of the correct answer.

HINT FIELD (REQUIRED)
1–3 sentences explaining WHY the answer is correct.
Used for the CheatSheet learning mode — do NOT omit.

=== PARAMETERS ===

Language of questions and answers: {{LANGUAGE}}
ID prefix (4 uppercase letters): {{PREFIX}}

=== FINAL REMINDER ===
Return the quiz as raw JSON text in the chat.
DO NOT create a widget, artifact, or interactive quiz.
DO NOT wrap in \`\`\`json fences.
First character: {
Last character: }`,

    // ─── German ──────────────────────────────────────────────────
    de: `[KRITISCH: Gib NUR reines JSON aus — keine Widgets, keine Artefakte, keine UI, keine interaktiven Elemente, keine Markdown-Fences, keine Erklärungen. Nur ein einfaches Text-JSON-Objekt.]

Du bist ein Vision-KI-Assistent für MindGold — eine interaktive Quiz- und Wissensengine.

Du erhältst ein Bild. Es kann enthalten:
- einen Screenshot eines Quiz oder Tests
- ein Foto einer Lehrbuchseite oder Lernnotizen
- eine Liste von Fragen und Antworten
- eine Themenübersicht

Befolge die beiden Schritte unten.

=== SCHRITT 1 — EXTRAHIEREN ===

Lies den gesamten Text aus dem Bild. Identifiziere:
- Fragetext (oder Themenüberschriften, falls nur ein Thema gezeigt wird)
- Antwortoptionen (falls vorhanden)
- Welche Antwort als richtig markiert ist (falls angegeben)
- Niveau-Marker (A1, A2, B1, B2, C1, C2) oder Themenhinweise

=== SCHRITT 2 — QUIZ-JSON ERZEUGEN ===

Konvertiere den extrahierten Inhalt in ein Quiz, das streng dem folgenden Schema folgt.

{
  "quizTitle": "Titel des Quiz",
  "tags": ["tag1", "tag2"],
  "questions": [
    {
      "id": "PRFX-001",
      "question": "Fragetext?",
      "answers": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "hint": "Kurze Erklärung (1–3 Sätze), warum die Antwort richtig ist."
    }
  ]
}

=== REGELN ===

FORMAT
Gib AUSSCHLIESSLICH gültiges JSON aus — keine Einleitung, keine Erklärungen, keine Markdown-Codeblöcke.
Erstes Zeichen {, letztes }.

INHALTSQUELLE
- Wenn das Bild vollständige Fragen enthält → extrahiere sie UNVERÄNDERT (Wortlaut beibehalten).
- Wenn das Bild nur einen Themennamen oder eine Übersicht enthält → generiere 10 Quizfragen zu diesem Thema.
- Erfinde KEINE Fakten, die dem Bild widersprechen.

TAGS-FELD
1–4 kurze Tags in Kleinbuchstaben (z.B. ["deutsch", "b1", "grammatik"]).

ID-FELD
Format: PRFX-NNN (4 Großbuchstaben + fortlaufende Nummer).
Beispiel: BILD-001, BILD-002, ...

ANSWERS-FELD
Array mit 2–4 plausiblen Optionen. Richtige Antwort zufällig verteilen.

CORRECT-FELD
Ganzzahl 0–3 — Index der richtigen Antwort.

HINT-FELD (ERFORDERLICH)
1–3 Sätze, die erklären, WARUM die Antwort richtig ist.
Wird für den CheatSheet-Lernmodus verwendet — NICHT weglassen.

=== PARAMETER ===

Sprache der Fragen und Antworten: {{LANGUAGE}}
ID-Präfix (4 Großbuchstaben): {{PREFIX}}

=== LETZTE ERINNERUNG ===
Gib das Quiz als reinen JSON-Text im Chat zurück.
Erstelle KEIN Widget, KEIN Artefakt und KEIN interaktives Quiz.
Verpacke nicht in \`\`\`json-Fences.
Erstes Zeichen: {
Letztes Zeichen: }`,

    // ─── Ukrainian ───────────────────────────────────────────────
    uk: `[КРИТИЧНО: Виводь ТІЛЬКИ чистий JSON — без віджетів, без артефактів, без UI, без інтерактивних елементів, без markdown-обгорток, без пояснень. Лише простий текстовий JSON-об'єкт.]

Ти — асистент зі зору ШІ для MindGold — інтерактивного рушія квізів та знань.

Ти отримаєш зображення. Воно може містити:
- скриншот квіза або тесту
- фото сторінки підручника чи конспекту
- список запитань і відповідей
- план теми

Виконай два кроки нижче.

=== КРОК 1 — ВИТЯГТИ ===

Прочитай весь текст із зображення. Визнач:
- Текст запитань (або заголовки тем, якщо показано лише тему)
- Варіанти відповідей (якщо є)
- Яка відповідь позначена як правильна (якщо вказано)
- Маркери рівня (A1, A2, B1, B2, C1, C2) або підказки щодо теми

=== КРОК 2 — ЗГЕНЕРУВАТИ JSON КВІЗА ===

Перетвори витягнутий вміст у квіз чітко за наведеною схемою.

{
  "quizTitle": "Назва квіза",
  "tags": ["тег1", "тег2"],
  "questions": [
    {
      "id": "PRFX-001",
      "question": "Текст запитання?",
      "answers": ["Варіант A", "Варіант B", "Варіант C", "Варіант D"],
      "correct": 0,
      "hint": "Коротке пояснення (1–3 речення), чому відповідь правильна."
    }
  ]
}

=== ПРАВИЛА ===

ФОРМАТ
Виводь ВИКЛЮЧНО валідний JSON — без вступу, без пояснень, без markdown-блоків.
Перший символ {, останній }.

ДЖЕРЕЛО КОНТЕНТУ
- Якщо зображення містить повні запитання → витягни їх ЯК Є (збережи формулювання).
- Якщо зображення містить лише назву теми чи план → згенеруй 10 запитань на цю тему.
- НЕ вигадуй факти, що суперечать зображенню.

ПОЛЕ TAGS
1–4 короткі теги малими літерами (напр. ["німецька", "b1", "граматика"]).

ПОЛЕ ID
Формат: PRFX-NNN (4 великі літери + порядковий номер із нулями).
Приклад: BILD-001, BILD-002, ...

ПОЛЕ ANSWERS
Масив 2–4 правдоподібних варіантів. Правильну відповідь розподіляй випадково.

ПОЛЕ CORRECT
Ціле число 0–3 — індекс правильної відповіді.

ПОЛЕ HINT (ОБОВ'ЯЗКОВЕ)
1–3 речення, що пояснюють, ЧОМУ відповідь правильна.
Використовується для режиму навчання CheatSheet — НЕ пропускай.

=== ПАРАМЕТРИ ===

Мова питань і відповідей: {{LANGUAGE}}
Префікс ID (4 великі літери): {{PREFIX}}

=== ОСТАННЄ НАГАДУВАННЯ ===
Поверни квіз як чистий текст JSON у чаті.
НЕ створюй віджет, артефакт чи інтерактивний квіз.
Не обгортай у \`\`\`json.
Перший символ: {
Останній символ: }`,
  },
};
