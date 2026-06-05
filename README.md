# FastEx

## Demo

Official URL:

- [https://fastex.coffeeocha.com/](https://fastex.coffeeocha.com/)

Backup Vercel URL:

- [https://fastex-henna.vercel.app](https://fastex-henna.vercel.app)

## 中文版使用说明

FastEx 是一个轻量、直观的多币种汇率换算工具，适合日常快速查看不同货币之间的大致换算结果。

- 打开网页后，你可以在任意一行直接输入金额，其他货币会自动同步更新
- 你可以添加自己常用的货币，也可以删除不需要的货币
- 进入排序模式后，可以上下拖动货币顺序；排在最上面的货币会作为当前的基准货币
- 汇率数据会定时刷新，并在页面顶部显示最近一次更新时间

如果你主要在手机上使用：

- 安卓手机可以在浏览器中选择 `Add to Home screen` 或 `Install app`
- iPhone 可以在 Safari 中点击 `分享`，然后选择 `添加到主屏幕`
- 添加完成后，就可以像打开普通 App 一样从桌面快速进入 FastEx

## English Overview

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
