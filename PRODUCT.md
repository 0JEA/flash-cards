# Product

## Register

product

## Users

University CS students studying for written tests: definitions, arguments, code traces, math derivations, trees. Today one student (the owner, AUCSC 370/310/325/Ethics) on a laptop window about 632×595 and on a phone; the goal is a public app other students can pick up without help (owner, 2026-10-16). Sessions are short and often tired: evenings at a desk, or on a phone between classes.

## Product Purpose

A spaced-repetition study app built on learning research: every card needs a committed answer before feedback, misses come back at the end of the session, cards are learned only after repeated correct recall on separate days, and the progress number is delayed recall. Help pages teach a card step by step when the student is stuck. Success: the student keeps coming back, recalls more on test day, and never feels the app is wasting their time.

## Brand Personality

Warm, encouraging, trustworthy. It feels like a well-made study object, not a game and not a tool for engineers: kind about mistakes, quietly pleased about progress, never loud. Voice is plain and direct, like a good tutor sitting beside you.

## Anti-references

- Anything that looks AI-made. This is about **layout, element choice, type and motion**, not only colour: no rounded-card grids, no hero numbers, no fade-up-on-scroll, no Inter-everything, no gradient accents.
- Gamified study apps: streaks, XP, confetti, mascots, guilt notifications.
- Anki-style utilitarian: dense grey forms, a 2008 desktop app.
- Generic SaaS templates: icon grids, identical cards, big stat tiles.
- Terminal/hacker: monospace everywhere, uppercase tracked labels (the app's old look).

## Design Principles

1. **Borrowed, then reworked.** Every element comes from a specific pre-AI source (a real product, object or design system: the base language is Apple iOS 13, 2019, dark) and is reworked so all the parts read as one object. Never the default component.
2. **The card is the task.** On the study screen nothing competes with the question and the answer; chrome recedes.
3. **Kind feedback, honest grading.** Mistakes are normal and explained; right answers are acknowledged warmly, without fanfare. Correctness is never shown by colour alone.
4. **Familiar before clever.** Standard affordances (back, sheets, lists, switches) behave the way phones taught everyone; novelty goes into texture and motion, never into how a control works.
5. **Fits the window.** The study screen always fits without scrolling (text scales to fit); every other screen scrolls normally.

## Accessibility & Inclusion

WCAG 2.2 AA: 4.5:1 text contrast (3:1 large text and UI parts), full keyboard use with visible focus, right/wrong always shown with a shape and a word as well as colour (colourblind-safe, since the app will be public), `prefers-reduced-motion` replaces every movement with a crossfade or nothing, touch targets at least 44×44 px. (Accessibility level is a default chosen for a public app; the owner did not pick one explicitly.)
