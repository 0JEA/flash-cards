# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **Ethics Flashcard Quiz** — a single-file HTML application for studying Software Engineering Code of Ethics and Professional Practice (SECEPP). It contains 41 multiple-choice questions with interactive features including score tracking, progress visualization, and shuffled question/answer ordering.

## Architecture

The `index.html` file is self-contained with:

- **HTML Structure** (lines 1-53): Container with score bar, question card, options, and navigation buttons
- **CSS Styling** (lines 7-34): Material Design-inspired styling with subtle animations and responsive layout
  - Score bar with green progress fill
  - Card-based UI for questions and options
  - Color coding for correct (green) and wrong (red) answers
- **JavaScript Logic** (lines 55-186):
  - `raw` array: Hardcoded quiz data (question, correct answer, shuffled options)
  - `shuffle()`: Fisher-Yates shuffle for randomizing question and answer order
  - State management: `idx` (current question), `correct`/`wrong` counters, `answered[]` array (tracks user responses)
  - `render()`: Displays current question, manages button states, shows feedback
  - `selectAnswer()`: Handles answer selection, updates score, disables options, triggers completion when done
  - `move()`: Navigation between questions with bounds checking
  - `showDone()`: Final score screen with restart option

## Development Notes

### Running the App
- Open `index.html` directly in a browser (no build step or dependencies required)
- All data is embedded in the file; no external API calls or database

### Modifying Questions
- Edit the `raw` array (lines 56-96) to add/remove/update questions
- Structure: `{q: "question text", correct: "correct answer text", opts: [array of options]}`
- The app automatically shuffles questions and answers on load

### Styling
- Edit CSS in the `<style>` block for colors, spacing, fonts, or layout
- Uses CSS custom approach (no preprocessor) for simplicity
- Responsive design supports mobile and desktop

### Key Behaviors
- Questions shuffle on page load; restarting reloads the page to reshuffle
- Once an answer is selected, all buttons are disabled and correct answer is revealed
- Navigation buttons prevent going before the first question or after the last
- Score bar fills as questions are answered
- Completion screen shows percentage and allows restart

## Constraints

- Single-file design: All HTML, CSS, and JavaScript in one file
- No external dependencies
- Local storage not used; progress resets on page reload
- Questions must be manually updated in the code (no admin interface)
