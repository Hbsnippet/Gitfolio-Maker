# Gitfolio Maker

**Turn your GitHub profile into a portfolio worth sharing.**

Gitfolio Maker transforms your GitHub profile and repositories into a clean, personalized developer portfolio. Enter a GitHub username, preview the profile, and generate a dedicated portfolio page without manually building one from scratch.

## ✨ Features

- **Instant Profile Preview** — Enter a GitHub username to preview profile information before generating a portfolio.
- **Automatic Portfolio Generation** — Generate a dedicated portfolio page using GitHub profile and repository data.
- **Three Visual Themes** — Choose a style that suits you:
  - **Editorial** — A warm, cream-colored design with an editorial feel.
  - **Mono** — A minimal, monochromatic aesthetic.
  - **Sketchbook** — A playful style with soft, pink-toned colors.
- **GitHub Integration** — Fetches public profile and repository information through the GitHub API.
- **Responsive Interface** — A polished experience across different screen sizes.
- **Shareable Portfolio URLs** — Each generated portfolio has its own URL that you can share.
- **Light and Dark Modes** — Switch the appearance of your generated portfolio.
- **Modern UI** — A dreamy visual identity with subtle interactions and carefully considered typography.

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/) — React framework and App Router
- [React](https://react.dev/) — UI components
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [GitHub REST API](https://docs.github.com/en/rest) — Profile and repository data
- [Bun](https://bun.sh/) — JavaScript runtime and package manager

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Bun](https://bun.sh/docs/installation)
- A GitHub account
- A GitHub personal access token for API access

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Hbsnippet/Gitfolio-Maker.git
cd Gitfolio-Maker
```

**2. Install dependencies**

```bash
bun install
```

**3. Configure environment variables**

Create a `.env.local` file in the project root and add the GitHub token using the environment variable name expected by the server-side GitHub integration in `lib/github.ts`.

```env
GITHUB_TOKEN=your_github_token
```

If your implementation uses a different variable name, use that exact name instead.

Keep your token private. Never commit `.env.local` or expose the token through client-side code.

**4. Start the development server**

```bash
bun dev
```

**5. Open the application**

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 💡 How It Works

1. Enter a GitHub username.
2. Preview the GitHub profile information.
3. Generate a personalized portfolio.
4. Explore the generated page and choose a visual theme.
5. Share your portfolio URL.

## 📁 Project Structure

```text
app/
├── api/
│   ├── embed/
│   └── github/
│       └── [username]/
├── [username]/
│   ├── loading.tsx
│   └── page.tsx
├── globals.css
├── layout.tsx
└── page.tsx

components/
└── portfolio/
    ├── about-section.tsx
    ├── contribution-heatmap.tsx
    ├── language-list.tsx
    ├── portfolio-footer.tsx
    ├── portfolio-shell.tsx
    ├── profile-hero.tsx
    └── project-list.tsx

lib/
├── github.ts
└── utils.ts
```

*The structure above highlights the main application areas; additional UI components and configuration files may exist.*

## 🔐 Environment Variables

| Variable | Purpose |
|---|---|
| `GITHUB_TOKEN` | Server-side GitHub API authentication, if this is the variable name configured in `lib/github.ts`. |

Never expose secrets using a `NEXT_PUBLIC_` prefix. Keep environment variables configured on your deployment platform as well as locally.

## 🌐 Deployment

Gitfolio Maker can be deployed to [Vercel](https://vercel.com/), which supports Next.js applications.

1. Import the repository into Vercel.
2. Configure the required GitHub token as a server-side environment variable.
3. Deploy the application.
4. Verify that profile previews and generated portfolio pages work in production.

## 🗺️ Roadmap

Potential areas for future improvements:

- More portfolio themes and customization options.
- Additional portfolio sections and layout controls.
- Improved loading, validation, and API error states.
- Further accessibility and performance improvements.

## 🤝 Contributing

Contributions, ideas, and feedback are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test your changes locally.
5. Open a pull request describing your improvements.

## 📄 License

No license has been specified here. Add a `LICENSE` file and update this section when you choose a license.

---

**Built for developers who want a better way to showcase their work.**

If you find Gitfolio Maker useful, consider giving the repository a ⭐ on GitHub.
