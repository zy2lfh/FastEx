# FastEx

FastEx is a lightweight multi-currency exchange app built with React, TypeScript, and Vite.

It is designed for fast everyday conversions on both desktop and mobile web:

- Add and remove currencies
- Edit any currency amount and recalculate all others
- Reorder currencies with a mobile-friendly sort mode
- Use cached exchange rates for a snappy experience
- Adapt to phone-sized screens and touch interactions

## Experience

FastEx is optimized not only for desktop browsers, but also for mobile web usage.

- Responsive layouts adapt to smaller phone screens
- Touch-first interactions make swipe, tap, and reordering easier on mobile devices
- The interface is designed to stay fast and readable on both large and small screens

## Mobile App-like Use

FastEx can also be added to your phone's home screen for a faster, more app-like experience.

- On Android, open FastEx in your browser and choose `Add to Home screen` or `Install app`
- On iPhone, open FastEx in Safari, tap `Share`, then choose `Add to Home Screen`
- Once added, you can launch it directly from your home screen just like a lightweight app for quicker everyday use

## Demo

Official URL:

- [https://fastex.coffeeocha.com/](https://fastex.coffeeocha.com/)

Backup Vercel URL:

- [https://fastex-henna.vercel.app](https://fastex-henna.vercel.app)

## Tech Stack

- React 19
- TypeScript
- Vite
- Frankfurter exchange-rate API

## Local Development

Requirements:

- Node.js 20+
- npm 10+

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```text
src/
  App.tsx
  main.tsx
  styles.css
  lib/
    currencies.ts
    rates.ts
  types.ts
public/
  favicon.svg
  site.webmanifest
```

## Data Source

FastEx currently uses the Frankfurter API for exchange-rate data:

- https://www.frankfurter.app/

Exchange rates are cached in the browser to reduce repeated requests and improve responsiveness.

## Deployment

This project is configured to work well with Vercel.

Production traffic should use the custom domain:

- [https://fastex.coffeeocha.com/](https://fastex.coffeeocha.com/)

The Vercel domain remains available as a fallback URL:

- [https://fastex-henna.vercel.app](https://fastex-henna.vercel.app)

Recommended deployment flow:

1. Push the code to GitHub
2. Import or connect the repository in Vercel
3. Set the production branch to `main`
4. Point the custom domain to the Vercel project
5. Let Vercel auto-deploy on every push to `main`

## License

This project is licensed under the MIT License. See [LICENSE](/Users/fanghuali/Documents/fastex/LICENSE).
