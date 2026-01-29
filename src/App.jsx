import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SalesJournal from './pages/SalesJournal';
import { useLocalStorage } from './hooks/useLocalStorage';

// Simple nav component to highlight active link
const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`px-4 py-2 rounded-md transition ${isActive ? 'bg-blue-700 text-white' : 'hover:bg-blue-500'}`}
    >
      {children}
    </Link>
  );
};

function App() {
  const [transactions, setTransactions] = useLocalStorage('sales-transactions', []);

  const addTransaction = (transaction) => {
    setTransactions([...transactions, { ...transaction, id: Date.now() }]);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
        <nav className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {/* Optional Icon */}
              <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold">S</div>
              <h1 className="text-xl font-bold">Group 3 Sales App</h1>
            </div>
            <div className="space-x-2">
              <NavLink to="/">Dashboard</NavLink>
              <NavLink to="/journal">Sales Journal</NavLink>
            </div>
          </div>
        </nav>

        <main className="container mx-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard transactions={transactions} />} />
            <Route 
              path="/journal" 
              element={<SalesJournal addTransaction={addTransaction} transactions={transactions} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;