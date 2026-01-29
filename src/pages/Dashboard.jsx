
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, 
  LineChart, Line, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, ShoppingCart, Award, ArrowRight, Calendar } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
    </div>
    {Icon && (
      <div className={`p-3 rounded-full ${color} text-white shadow-lg`}>
        <Icon size={24} />
      </div>
    )}
  </div>
);

// Helper for Weekly grouping
const getWeekNumber = (dateStr) => {
  const date = new Date(dateStr);
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date - start + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return Math.ceil((day + 1) / 7);
};

const Dashboard = ({ transactions = [] }) => {
  const [period, setPeriod] = useState('daily'); // 'daily', 'weekly', 'monthly'

  const safeTransactions = useMemo(() => transactions.filter(t => t && typeof t === 'object'), [transactions]);

  const totalSales = useMemo(() => safeTransactions.reduce((acc, curr) => acc + (Number(curr.total) || 0), 0), [safeTransactions]);

  // 1. Line Chart Data (Dynamic Period)
  const chartData = useMemo(() => {
    const grouped = {};
    safeTransactions.forEach(t => {
      const date = t.date || 'Unknown';
      let key = date;

      if (period === 'weekly') {
        const year = date.split('-')[0];
        const week = getWeekNumber(date);
        key = `W${week}-${year}`;
      } else if (period === 'monthly') {
        key = date.slice(0, 7); // YYYY-MM
      }

      grouped[key] = (grouped[key] || 0) + (Number(t.total) || 0);
    });
    return Object.keys(grouped).sort().map(key => ({ date: key, sales: grouped[key] }));
  }, [safeTransactions, period]);

  // 2. Bar Chart Data (Sales By Product)
  const productData = useMemo(() => {
    const grouped = {};
    safeTransactions.forEach(t => {
      const name = t.productName || 'Unknown';
      grouped[name] = (grouped[name] || 0) + (Number(t.total) || 0);
    });
    return Object.keys(grouped).map(name => ({ name, value: grouped[name] }));
  }, [safeTransactions]);

  // 3. Pie Chart Data (Sales By Category - NEW LOGIC)
  const categoryData = useMemo(() => {
    const grouped = {};
    safeTransactions.forEach(t => {
      // If no category (old data), group as 'Other'
      const category = t.category || 'Other';
      grouped[category] = (grouped[category] || 0) + (Number(t.total) || 0);
    });
    return Object.keys(grouped).map(name => ({ name, value: grouped[name] }));
  }, [safeTransactions]);

  const topItems = useMemo(() => [...productData].sort((a, b) => b.value - a.value).slice(0, 5), [productData]);

  // Empty State
  if (safeTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200 text-center">
        <div className="bg-indigo-50 p-6 rounded-full mb-6">
          <TrendingUp size={48} className="text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">No Sales Data Yet</h2>
        <p className="text-slate-500 max-w-md mb-8">
          Your dashboard looks a bit empty! Record your first transaction in the Journal to generate charts and insights.
        </p>
        <Link 
          to="/journal" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2"
        >
          Go to Sales Journal <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Revenue" value={`$${totalSales.toFixed(2)}`} icon={TrendingUp} color="bg-indigo-500" />
        <StatCard title="Total Transactions" value={safeTransactions.length} icon={ShoppingCart} color="bg-emerald-500" />
        <StatCard title="Top Product" value={topItems[0]?.name || 'N/A'} icon={Award} color="bg-amber-500" />
      </div>

      {/* Chart 1: Line Chart (Sales Trend) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Calendar size={20} className="text-indigo-500"/> 
            Sales Trend ({period.charAt(0).toUpperCase() + period.slice(1)})
          </h3>
          {/* Period Selector */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {['daily', 'weekly', 'monthly'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  period === p 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2 & 3: Bar & Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bar Chart: Sales By Product (For Grading Marks) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-6">Sales by Product (Bar)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Sales By Category (For Self-Research) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-6">Sales Proportion by Category (Pie)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={categoryData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80} 
                  paddingAngle={5}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top 5 Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-700 mb-6">Top Performing Items</h3>
        <div className="overflow-hidden rounded-lg border border-slate-100">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                <th className="p-3 text-xs font-semibold text-slate-500 uppercase text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="p-3 text-slate-700 font-medium">{item.name}</td>
                  <td className="p-3 text-right text-indigo-600 font-bold">${item.value.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;