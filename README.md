```markdown
# FitFuel Pro

FitFuel Pro is a responsive nutrition tracking dashboard designed to help users monitor their daily caloric intake and macronutrient distribution. Built with React and Vite, the application leverages natural language processing to simplify food logging and provides real-time data visualization for performance analysis.

## Features

- **Natural Language Logging:** Users can input freeform text (e.g., "1 bowl rice and 2 eggs") to automatically retrieve nutritional data.
- **Real-Time Analytics:**
  - **Weekly Performance:** Bar charts tracking calorie intake over the last 7 days.
  - **Daily Trends:** Line graphs showing consumption trends throughout the current session.
  - **Macro Breakdown:** Detailed progress bars for Protein, Carbohydrates, and Fats.
  - **Goal Tracking:** Doughnut chart visualizing progress toward a customizable daily calorie target.
- **Data Persistence:** Automatically saves user history and settings to LocalStorage, ensuring data is retained between sessions without requiring a backend database.
- **Responsive Design:** A fluid layout that adapts to mobile (stacked), tablet (2-column), and desktop (dashboard) viewports.
- **Theme Support:** Includes a system-wide toggle for Light and Dark modes.

## Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Custom CSS3 with CSS Variables and Media Queries
- **Data Visualization:** Chart.js and React-Chartjs-2
- **API:** CalorieNinja API (for nutrition data)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation and Setup

1. **Clone the repository**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/fitfuel-pro.git](https://github.com/YOUR_USERNAME/fitfuel-pro.git)
   cd fitfuel-pro

```

2. **Install dependencies**
```bash
npm install

```


3. **Configure API Key**
This project requires a valid API key from CalorieNinja.
* Create a new file named `config.js` inside the `src/` directory.
* Add the following code to the file:
```javascript
// src/config.js
export const API_KEY = "YOUR_CALORIENINJA_API_KEY";

```




*(Note: `src/config.js` is included in .gitignore to prevent sensitive keys from being exposed.)*
4. **Run the development server**
```bash
npm run dev

```


5. **Build for production**
To create a production-ready build:
```bash
npm run build

```



## Project Structure

```
fitfuel-pro/
├── public/              # Static assets (favicons, etc.)
├── src/
│   ├── assets/          # Images and global styles
│   ├── App.css          # Main stylesheet & responsive definitions
│   ├── App.jsx          # Main application logic & components
│   ├── config.js        # API Configuration (Not tracked by Git)
│   └── main.jsx         # Entry point
├── .gitignore           # Git ignore rules
├── index.html           # HTML template
├── package.json         # Project dependencies and scripts
└── vite.config.js       # Vite configuration

```

## Usage

* **Add Food:** Type a food item and quantity into the input field (e.g., "1 cup oatmeal") and press Enter or click "Add Entry".
* **Set Goals:** Use the "Daily Target" input to adjust your calorie goal. The progress chart will update automatically.
* **View History:** Scroll through the "Activity Log" to see past entries. Click the arrow on an item to view specific macro details.
* **Delete Entries:** Click the "X" button on a history item to remove it. This will update all charts immediately.

## License

This project is open source and available under the [MIT License](https://www.google.com/search?q=LICENSE).


