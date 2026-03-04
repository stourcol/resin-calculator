# 🧪 ResinCalc

[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**ResinCalc** is a high-precision material calculator designed for resin artists and makers. Simply upload an SVG vector file, provide the real-world dimensions, and let ResinCalc compute the exact amount of resin and catalyst required for your project.

---

## ✨ Key Features

- **📐 SVG Area Analysis**: Automatically calculates the surface area of complex shapes directly from `.svg` files.
- **⚗️ Smart Mixture Ratios**: Supports standard (1:1) and professional (2:1) resin-to-catalyst ratios.
- **🌐 Bilingual Interface**: Seamlessly switch between English and Spanish.
- **🌓 Adaptive UI**: Elegant dark and light modes tailored for a premium user experience.
- **📏 Precision Controls**: Input real-world width, height, and thickness (cm) for accurate volume calculations.
- **⚡ Real-time Feedback**: Instant results as you adjust parameters.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/stourcol/resin-calculator.git
   cd resin-calculator
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Run the development server:**
   ```bash
   yarn dev
   # or
   npm run dev
   ```

4. **Build for production:**
   ```bash
   yarn build
   # or
   npm run build
   ```

---

## 🛠️ Tech Stack

- **Core**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + PostCSS
- **Icons**: Lucide React
- **Analysis**: Custom SVG processing engine for area calculation

---

## 📁 Project Structure

```text
resin-calculator/
├── src/
│   ├── features/
│   │   ├── calculator/     # Logic and components for calculations
│   │   └── svg-analyzer/   # SVG processing and area analysis hooks
│   ├── App.tsx             # Main application layout and state
│   ├── translations.ts     # Multi-language support configuration
│   └── index.css           # Global styles and design tokens
├── public/                 # Static assets
└── index.html              # Entry point
```

---

## 📝 Usage Guide

1. **Upload**: Drag and drop or click to upload your `.svg` design.
2. **Dimension**: Enter the real-world width and height of the finished piece in centimeters.
3. **Thickness**: Set the desired thickness (depth) of the resin layer.
4. **Ratio**: Select your resin's mixture ratio (e.g., 2:1).
5. **Result**: View the precise grams/milliliters needed for both Part A (Resin) and Part B (Catalyst).

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request if you have suggestions for new features or improvements.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<p align="center">
  Crafted with ❤️ for the maker community.
</p>
