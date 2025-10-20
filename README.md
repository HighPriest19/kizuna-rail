# Kizuna Rail (絆鉄道)

A brownfield web development training project designed to build real-world software engineering expertise through reverse engineering, refactoring, and debugging existing codebases.

## What is this?

Kizuna Rail is a fictional scenic railway booking website for tourists in Japan. While the company isn't real, the development challenges are. This project simulates a real brownfield codebase—existing code written by someone else that needs improvement, bug fixes, and new features.

## Purpose

This repository exists to develop essential software engineering skills that separate competent developers from true experts:

- **Reverse engineering** unfamiliar codebases to understand architecture and data flow
- **Refactoring** poorly structured code while maintaining functionality
- **Debugging** complex issues across multiple layers of the application
- **Code archaeology** through reading, tracing, and comprehending someone else's implementation decisions
- **Technical decision-making** about when to refactor vs. rewrite vs. extend existing patterns
- **Self-directed problem solving** without step-by-step tutorials

These skills define professional software engineering. Most developers spend 80% of their time working with existing code, not building greenfield projects.

## Who is this for?

- **Students**: This project was created for university-level software development courses, but anyone learning web development is welcome to use it
- **Self-learners**: Found this repo on your own? Great! Work through the scenarios at your own pace
- **Educators**: Feel free to incorporate these scenarios into your curriculum

## Why Brownfield Development?

Real-world software development means inheriting legacy systems with technical debt, inconsistent patterns, undocumented decisions, and code written by developers with varying skill levels. Learning to effectively reverse engineer these systems, refactor problematic areas, and extend functionality without introducing regressions is what distinguishes senior developers from junior ones.

Greenfield tutorials teach you syntax. Brownfield projects teach you engineering.

## Important Notes

**This codebase contains intentional technical debt.** You'll find suboptimal architecture, missing error handling, inconsistent patterns, and code that needs refactoring—all by design. These are learning opportunities, not mistakes.

**Do not submit PRs to fix code issues.** The technical debt, bugs, and architectural issues are intentional teaching moments for developers working through the scenarios.

**However**, if you find:
- Actual errors that break the learning experience
- Typos in documentation or scenario descriptions
- Ideas for new scenarios or challenges

Please open an issue! Contributions to improve the educational value are welcome.

## Getting Started

1. Clone or fork this repository
2. Install dependencies: `pnpm install`
3. Start the development server: `pnpm run dev`
4. Visit `/scenarios` to see available development challenges

Each scenario simulates realistic work situations requiring reverse engineering, refactoring, debugging, or feature extension.

## Technology Stack

- **Backend**: Node.js with Express framework
- **Templating**: EJS
- **Styling**: Modern nested CSS with custom properties
- **Database**: JSON-based data store, pretending to be a relational database

## Skills You'll Develop

- Code comprehension and reverse engineering
- Refactoring techniques and code smell identification
- Debugging across the full stack
- Working with unfamiliar frameworks and patterns
- Making architectural decisions in existing systems
- Reading and understanding someone else's code
- Git workflow in team environments

## License

This is an educational project. Feel free to use it for learning purposes.