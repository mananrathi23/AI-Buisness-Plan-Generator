
# AI-Business-Plan-Generator

A **React-based** web application that generates **AI-powered business plans** using user inputs such as business name, industry, target market, and unique selling points (USPs). The app includes options to export the generated plans as PDFs, Word documents, or plain text. It also features local storage for saving plans, word count, sample plan generation, and a responsive UI with a light/dark mode toggle.

---

## Table of Contents
- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Backend](#backend)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

##  Features
- **AI-Powered Plans**: Generate detailed business plans using **DeepSeek-R1** via the **OpenRouter API**.
- **Custom Inputs**: Enter details such as business name, industry, target market, and unique selling points for a tailored business plan.
- **Export Options**: Download plans in **PDF**, **Word**, or **plain text** formats.
- **Local Storage**: Save and load plans locally using the browser’s storage.
- **Word Count & Reading Time**: Displays the length of the plan and the estimated reading time.
- **Sample Plan**: Generate a sample plan for a fictional business (e.g., "Sample Coffee Shop").
- **Responsive UI**: Offers a wide card layout (max width ~1792px), compact design, centered inputs, and mobile-friendly interface.
- **Light/Dark Mode**: Toggle between light and dark themes, with automatic system preference detection.
- **Feedback**: Toast notifications for user actions and error messages.
- **Accessibility**: Includes focus rings, labeled inputs, and high-contrast themes for improved accessibility.



## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/AI-Business-Plan-Generator.git
cd AI-Business-Plan-Generator
```

### 2. Install Dependencies
Run the following command to install the required dependencies:
```bash
npm install
```
Required dependencies: `jspdf`, `docx`, `file-saver`, `axios`.

### 3. Run Locally
Start the development server with:
```bash
npm run dev
```
This will open the app in your browser at [http://localhost:5173](http://localhost:5173).

---

##  Project Structure
```
AI-Business-Plan-Generator/
├── src/
│   ├── App.jsx           # Main component handling form, plan display, and dark mode
│   ├── index.css         # Tailwind CSS styles, animated background, dark mode
│   ├── main.jsx          # React entry point
├── public/
│   ├── vite.svg          # Vite assets
├── .gitignore            # Files to exclude from Git (e.g., node_modules, .env, dist)
├── package.json          # Project dependencies and scripts
├── tailwind.config.js    # Tailwind configuration with darkMode set to 'class'
├── postcss.config.cjs    # PostCSS config with Tailwind and Autoprefixer
```

---

## Add to `.env`

To use the OpenRouter API, you’ll need to add your API key to a `.env` file:
```
OPENROUTER_API_KEY=your-api-key
```

