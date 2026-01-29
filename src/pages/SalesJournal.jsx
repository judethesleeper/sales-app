import { useState } from 'react';
import productData from '../data/product-item.json';

const SalesJournal = ({ addTransaction, transactions }) => {
  const [formData, setFormData] = useState({
    selectedProduct: '', 
    customName: '',
    category: '', // <--- NEW: Stores category
    price: 0,
    quantity: 1,
    date: new Date().toISOString().split('T')[0]
  });

  const totalPrice = formData.price * formData.quantity;

  const handleProductChange = (e) => {
    const selectedName = e.target.value;
    
    if (selectedName === 'custom') {
      setFormData({ 
        ...formData, 
        selectedProduct: 'custom', 
        price: '', 
        customName: '',
        category: 'Custom' // Default for custom items
      });
    } else {
      const product = productData.find(p => p.itemName === selectedName);
      setFormData({ 
        ...formData, 
        selectedProduct: selectedName, 
        price: product.unitPrice,
        customName: product.itemName,
        category: product.category // <--- Capture category from JSON
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addTransaction({
      productName: formData.customName,
      category: formData.category, // <--- Save to history
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      date: formData.date,
      total: totalPrice
    });
    alert("Transaction Saved!");
    setFormData(prev => ({ ...prev, quantity: 1 }));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Input Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
          Record New Sale
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-600">Product</label>
              <select 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                onChange={handleProductChange}
                value={formData.selectedProduct}
                required
              >
                <option value="">-- Select Product --</option>
                {productData.map((p, index) => (
                  <option key={index} value={p.itemName}>
                    {p.itemName} ({p.unitPrice} THB)
                  </option>
                ))}
                <option value="custom" className="font-bold text-indigo-600">+ Add Custom Item</option>
              </select>
            </div>
            
            {formData.selectedProduct === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-600">Item Name</label>
                  <input 
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Service Charge"
                    required
                    onChange={e => setFormData({...formData, customName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-600">Price per unit</label>
                  <input 
                    type="number" 
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="0.00"
                    required
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-600">Quantity</label>
              <input 
                type="number" min="1" 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-600">Date</label>
              <input 
                type="date" 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
            <span className="text-slate-500 font-medium">Total Calculation</span>
            <span className="text-2xl font-bold text-emerald-600">${totalPrice.toFixed(2)}</span>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-md hover:shadow-lg">
            Save Transaction
          </button>
        </form>
      </div>

      {/* Transaction Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-6 text-slate-800">Transaction History</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Qty</th>
                <th className="p-4 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-400">No transactions yet.</td></tr>
              ) : (
                transactions.slice().reverse().map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 text-slate-600">{t.date}</td>
                    <td className="p-4 font-medium text-slate-800">{t.productName}</td>
                    <td className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                      {t.category || 'N/A'}
                    </td>
                    <td className="p-4 text-slate-600">${t.price}</td>
                    <td className="p-4 text-slate-600">{t.quantity}</td>
                    <td className="p-4 text-right font-bold text-indigo-600">${t.total.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesJournal;