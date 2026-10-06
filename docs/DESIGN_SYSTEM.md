# DESIGN_SYSTEM — Sayd Social Club

Tokens in `src/app/globals.css` (`@theme`). Contrast ratios computed (WCAG 2.1) against the background they sit on.

## Colour
| Token | Hex | Role | Contrast |
|---|---|---|---|
| night | #120F0E | page background (noir charbon) | — |
| night-2 | #1B1715 | raised surfaces (ticket box, inputs) | — |
| line | #2E2825 | hairlines, input borders | non-text |
| ink | #EFE6D8 | text | 15.4:1 on night · 12.3:1 on bordeaux |
| muted | #A89D8F | secondary text | 7.2:1 on night · 5.7:1 on bordeaux |
| sable | #D9B26A | primary action, accents | 9.6:1 on night · 7.6:1 on bordeaux · night text on sable 9.6:1 |
| terra | #DA7656 | errors, low stock, sold out | 6.1:1 on night |
| bottle | #16382B | ambassador band | ink on bottle 10.4:1 |
| bottle-ink | #8FD1B0 | success text | on night |
| event accent | per event (`events.accent`) | event header band | Sprezzatura #5A1420 |

## Type
- Display: Cormorant Garamond Variable (500, italic for edition and taglines). Self-hosted.
- Text/UI: DM Sans Variable. Self-hosted.
- Scale: `.t-hero` clamp(3.25rem, 12vw, 9.5rem) / 0.86 · `.t-h1` clamp(2.6rem, 7vw, 5.6rem) · `.t-h2` clamp(2rem, 4.2vw, 3.2rem) · `.t-h3` 1.75rem · body 1rem / 1.6.
- Sentence case everywhere, no tracked-out caps labels.

## Layout
- Max width 80rem, gutters 16 / 24 / 40 px.
- Lists over cards: events and perks are typographic rows with hairlines.
- Event pages take the event's accent as a full-width band.

## Components
Header (sticky, mobile sheet), footer (newsletter), EventFacts (dl), TicketPurchase (steppers, totals with GST/QST, form, inline errors), TicketCard (QR), SubmissionForm (honeypot), LegalPage.

## Motion
- One entrance (`.rise`) on the home hero only. Pulse bar while payment confirms.
- `prefers-reduced-motion` disables all animation.
- Next pass: references in REFERENCES.md, applied sparingly (hero reveal, ticket stepper feedback, confirmation moment).
