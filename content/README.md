# Curated content packs

Each folder in `content/` is a **content pack** — a curated course that shows up
in the **Course Catalog** on `/courses`. To add a course, create a new folder and
run the importer. No code changes needed.

```
content/
  <course-slug>/
    course.json          # required — metadata + structure
    lessons/*.md         # lesson bodies (Markdown / GFM)
    questions.json       # optional — MCQ practice questions
    flashcards.json      # optional — flashcards
```

## `course.json`

```jsonc
{
  "slug": "aws-saa",                 // unique, URL-safe; the course URL is /courses/aws-saa
  "title": "AWS Solutions Architect Associate",
  "description": "One-line summary shown on the catalog card.",
  "imageUrl": "/images/courses/aws.png", // optional
  "category": "certification",       // certification | college | competitive | custom
  "modules": [
    {
      "title": "Compute",
      "slug": "compute",             // optional (defaults to a slug of the title)
      "chapters": [
        {
          "title": "EC2 Basics",
          "slug": "ec2-basics",      // optional
          "lessons": [
            {
              "title": "What is EC2?",
              "slug": "what-is-ec2",           // optional (defaults to the file name)
              "file": "what-is-ec2.md",        // markdown file under lessons/ …
              "estimatedMinutes": 10
            }
            // …or inline instead of a file: { "title": "…", "content": "# Markdown…" }
          ]
        }
      ]
    }
  ]
}
```

Order is taken from array position (first module = module 1, etc.).

## Interactive lesson blocks

Lesson Markdown supports special fenced code blocks that render as
Duolingo-style interactive widgets and infographics. The fence language picks
the widget; the body is **strict JSON** (except `term`). Malformed JSON falls
back to a plain code block — it never breaks the lesson. Use them generously:
every predefined pack should teach with these, not walls of text.

````markdown
```quiz
{ "question": "…?", "options": ["A", "B", "C", "D"], "answer": 1, "explanation": "why" }
```

```flip
{ "title": "Key terms", "cards": [ { "front": "term", "back": "definition" } ] }
```

```sort
{ "prompt": "Put the steps in order", "items": ["first", "second", "third"] }
```
<!-- sort items MUST be written in the CORRECT order — the app shuffles them -->

```match
{ "prompt": "Match each item", "pairs": [ { "left": "item", "right": "its match" } ] }
```

```diagram
{ "type": "layers", "title": "Stack", "layers": [ { "label": "…", "detail": "…", "badge": "7" } ] }
```
<!-- diagram types:
  "layers"  → vertical stack (OSI-style); layers[]: { label, detail?, badge? }
  "flow"    → step-by-step process with arrows; steps[]: { label, detail? }; optional "direction": "vertical"
  "compare" → side-by-side; "left"/"right": { "title": string, "items": string[] } -->

```callout
{ "type": "exam", "body": "One crucial point to remember." }
```
<!-- callout types: "info" | "tip" | "warning" | "exam" -->

```term
R1# show ip interface brief
Interface    IP-Address    Status
```
<!-- plain text rendered in a terminal window; IOS-style prompts are highlighted -->
````

Conventions for curated lessons:

- 2–5 interactive blocks per lesson, spread through the text.
- End every lesson with one `quiz` block as a final knowledge check.
- Use `diagram` blocks instead of ASCII-art diagrams.
- Regular fenced code (` ```bash `, ` ```python `, …) still renders normally.

The AI lesson generator is taught the same syntax, so AI-generated courses get
the same interactive treatment automatically.

## `questions.json` (optional)

```jsonc
[
  {
    "topic": "EC2",
    "difficulty": "medium",           // easy | medium | hard
    "text": "Which instance type is best for…?",
    "options": ["A", "B", "C", "D"],
    "correctIdx": 1,                   // 0-based
    "explanation": "Because…",
    "tags": ["ec2", "compute"]         // optional
  }
]
```

## `flashcards.json` (optional)

```jsonc
[
  { "front": "What port does HTTPS use?", "back": "443", "topic": "Networking", "tags": [] }
]
```

## Importing

```bash
pnpm content:import          # import every pack in content/
pnpm content:import aws-saa  # import just one pack
```

The import is **idempotent** and safe to re-run:

- Course / module / chapter / lesson are **upserted by slug**, so re-importing
  updates content without wiping user progress.
- Questions and flashcards are **replaced** each time (they have no stable key).

Imported courses are **curated** (`ownerId = null`, published) — they appear in the
catalog for everyone and can't be deleted from the UI.

> Migrations must already be applied to the target database. The importer only
> reads `DATABASE_URL` from `.env`.
