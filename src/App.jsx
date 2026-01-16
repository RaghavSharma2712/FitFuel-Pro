import { useState, useEffect, useMemo } from 'react';
import { API_KEY } from './config';
import './App.css';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement);

function App() {
  // --- State Management ---
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('dark');
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealType, setMealType] = useState('Breakfast');
  const [filterQuery, setFilterQuery] = useState('');
  
  const [dailyGoal, setDailyGoal] = useState(2500);
  const [foodData, setFoodData] = useState([]);
  
  // Persistence flag to prevent overwriting local storage on initial load
  const [isLoaded, setIsLoaded] = useState(false);

  // Modal & Expandable states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  // --- Effects ---

  // Load data when date changes
  useEffect(() => {
    const savedData = localStorage.getItem(`fitfuel_${selectedDate}`);
    if (savedData) {
      setFoodData(JSON.parse(savedData));
    } else {
      setFoodData([]);
    }
    setIsLoaded(true); 
  }, [selectedDate]);

  // Save data when foodData changes (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(`fitfuel_${selectedDate}`, JSON.stringify(foodData));
    }
  }, [foodData, selectedDate, isLoaded]);

  // Theme effect
  useEffect(() => { 
    document.body.className = theme; 
  }, [theme]);

  const toggleTheme = () => setTheme(curr => curr === 'light' ? 'dark' : 'light');

  // --- Calculations ---

  const totalCalories = foodData.reduce((sum, item) => sum + item.calories, 0);

  const macros = useMemo(() => {
    return foodData.reduce((acc, item) => ({
      p: acc.p + item.protein_g,
      c: acc.c + item.carbohydrates_total_g,
      f: acc.f + item.fat_total_g
    }), { p: 0, c: 0, f: 0 });
  }, [foodData]);

  // Calculate Weekly Data for Bar Chart
  const getWeeklyData = () => {
    const labels = [];
    const data = [];
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      labels.push(dayName);

      // Use live state for today to ensure instant updates
      if (dateStr === todayStr) {
        data.push(totalCalories);
      } else {
        const savedDay = localStorage.getItem(`fitfuel_${dateStr}`);
        data.push(savedDay ? JSON.parse(savedDay).reduce((sum, item) => sum + item.calories, 0) : 0);
      }
    }
    return { labels, data };
  };
  
  const weeklyStats = getWeeklyData();

  // --- Handlers ---

  const getNutrition = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`, {
        headers: { 'X-Api-Key': API_KEY }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      
      if (data.items?.length > 0) {
        const newItems = data.items.map(item => ({
          ...item, 
          id: Date.now() + Math.random(), 
          meal: mealType
        }));
        setFoodData(prev => [...newItems, ...prev]);
        setQuery('');
      }
    } catch (err) { 
      alert("Failed to fetch nutrition data. Please check your connection."); 
    } finally { 
      setLoading(false); 
    }
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
    setIsModalOpen(true);
  };

  const proceedWithDelete = () => {
    if (itemToDelete) {
      setFoodData(prev => prev.filter(item => item.id !== itemToDelete));
      setItemToDelete(null);
      setIsModalOpen(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Chart Configurations ---
  const isDark = theme === 'dark';
  const textColor = isDark ? '#fff' : '#2b3674';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  
  const commonOptions = { 
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { legend: { display: false } }, 
    scales: { 
      x: { grid: { display: false }, ticks: { color: textColor, font: {family: 'Poppins'} } }, 
      y: { grid: { color: gridColor }, ticks: { color: textColor, font: {family: 'Poppins'} } } 
    } 
  };

  const lineData = {
    labels: ['Start', ...foodData.map((_, i) => `Entry ${i+1}`)],
    datasets: [{
      label: 'Calories',
      data: [0, ...foodData.map(item => item.calories).reduce((a, c, i) => [...a, (a[i]||0) + c], [])],
      borderColor: '#4318ff', 
      backgroundColor: 'rgba(67, 24, 255, 0.1)', 
      fill: true, 
      tension: 0.4, 
      pointRadius: 5
    }]
  };

  const weeklyChartData = {
    labels: weeklyStats.labels,
    datasets: [{
      label: 'Calories',
      data: weeklyStats.data,
      backgroundColor: weeklyStats.labels.map(l => l === new Date().toLocaleDateString('en-US', {weekday:'short'}) ? '#4318ff' : (isDark ? '#1e293b' : '#e0e7ff')),
      borderRadius: 8, 
      borderSkipped: false
    }]
  };

  const donutData = {
    datasets: [{
      data: [totalCalories, Math.max(0, dailyGoal - totalCalories)],
      backgroundColor: ['#4318ff', isDark ? '#1b254b' : '#eff4fb'],
      borderWidth: 0, 
      cutout: '85%', 
      borderRadius: 20
    }]
  };

  // --- Render ---
  return (
    <div className="app-container">
      
      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Removal</h3>
            <p>Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn-confirm" onClick={proceedWithDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="navbar">
        <div className="brand"><h1>FitFuel Pro</h1></div>
        <div className="nav-controls">
          <input 
            type="date" 
            className="date-input" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
          />
          <button className="theme-btn" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </nav>

      {/* Main Grid Layout */}
      <div className="top-section">
        
        {/* Left Column */}
        <div className="left-column">
          {/* Input Card */}
          <div className="card">
            <div className="card-header"><h2>Add Consumption</h2></div>
            <textarea 
              placeholder="e.g. '1 bowl rice and 2 eggs'..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), getNutrition())} 
            />
            <div className="input-actions">
              <select className="meal-select" value={mealType} onChange={(e) => setMealType(e.target.value)}>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
              </select>
              <button className="add-btn" onClick={getNutrition} disabled={loading}>
                {loading ? 'Processing...' : 'Add Entry +'}
              </button>
            </div>
          </div>

          {/* Session Trend Chart */}
          <div className="card">
            <div className="card-header"><h2>Session Trend</h2></div>
            <div className="chart-container">
              <Line data={lineData} options={commonOptions} />
            </div>
          </div>
          
          {/* History Log */}
          <div className="card">
             <div className="card-header"><h2>Activity Log</h2></div>
             <input 
               type="text" 
               className="filter-input" 
               placeholder="Search food items..." 
               value={filterQuery} 
               onChange={(e) => setFilterQuery(e.target.value)} 
             />
             <div className="history-list">
              {foodData.filter(i => 
                i.name.toLowerCase().includes(filterQuery.toLowerCase()) || 
                i.meal.toLowerCase().includes(filterQuery.toLowerCase())
              ).map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-main-row" onClick={() => toggleExpand(item.id)}>
                    <div className="item-left">
                      <div className="item-name">{item.name}</div>
                      <div className="item-sub">
                        <span className="meal-badge">{item.meal}</span>
                        <span>{item.serving_size_g}g</span>
                      </div>
                    </div>
                    <div className="item-right">
                      <div className="item-cal">{item.calories.toFixed(0)}</div>
                      <button className={`expand-btn ${expandedItems[item.id] ? 'open' : ''}`}>▼</button>
                      <button 
                        className="delete-btn" 
                        onClick={(e) => { e.stopPropagation(); confirmDelete(item.id); }}
                      >✕</button>
                    </div>
                  </div>
                  
                  {/* Expanded Macro View */}
                  {expandedItems[item.id] && (
                    <div className="history-details">
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="detail-label">Protein</span>
                          <span className="detail-val" style={{color: '#4318ff'}}>{item.protein_g}g</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Carbs</span>
                          <span className="detail-val" style={{color: '#05cd99'}}>{item.carbohydrates_total_g}g</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Fat</span>
                          <span className="detail-val" style={{color: '#ffb547'}}>{item.fat_total_g}g</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {foodData.length === 0 && (
                <p style={{textAlign:'center', color:'var(--text-secondary)', marginTop:'20px'}}>
                  No records found.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Daily Goal */}
          <div className="card">
            <div className="card-header"><h2>Daily Target</h2></div>
            <div className="goal-control">
              <span>Goal Target</span>
              <input 
                type="number" 
                value={dailyGoal} 
                onChange={(e) => setDailyGoal(Number(e.target.value))} 
              />
            </div>
            <div className="tracker-container">
              <Doughnut data={donutData} options={{cutout:'85%', plugins:{tooltip:{enabled:false}}}} />
              <div className="tracker-labels">
                <h3>{Math.round((totalCalories/dailyGoal)*100)}%</h3>
                <p>{totalCalories.toFixed(0)} kcal</p>
              </div>
            </div>
          </div>

          {/* Macro Breakdown */}
          <div className="card">
            <div className="card-header"><h2>Macro Breakdown</h2></div>
            <div className="macro-grid">
              {Object.entries({Protein: macros.p, Carbs: macros.c, Fats: macros.f}).map(([key, val], i) => (
                <div key={key} className="macro-row">
                  <span className="macro-label">{key}</span>
                  <div className="macro-bar-bg">
                    <div 
                      className="macro-bar-fill" 
                      style={{
                        width: `${Math.min(100, (val / (key==='Protein'?200:300))*100)}%`, 
                        background: i===0?'#4318ff':i===1?'#05cd99':'#ffb547'
                      }}
                    ></div>
                  </div>
                  <span className="macro-val">{val.toFixed(0)}g</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-section">
        <div className="card">
          <div className="card-header"><h2>Last 7 Days Performance</h2></div>
          <div className="bar-chart-container">
            <Bar data={weeklyChartData} options={commonOptions} />
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default App;