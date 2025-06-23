import React, { useState, useEffect } from 'react';
import { getItems } from '../services/itemService';
import { useAuth } from '../store/useAuth';
import { FaPlus, FaSearch, FaTimes, FaCheck } from 'react-icons/fa';

const ItemSelector = ({ selectedItems = [], onItemsChange, onClose }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    const initialQuantities = {};
    selectedItems.forEach(item => {
      initialQuantities[item.id] = item.quantity || 1;
    });
    setQuantities(initialQuantities);
  }, [selectedItems]);

  const fetchItems = async () => {
    if (!user) return;
    
    const { success, items: fetchedItems } = await getItems(user.uid);
    if (success) {
      setItems(fetchedItems);
    }
    setLoading(false);
  };

  const filteredItems = items.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isItemSelected = (itemId) => {
    return selectedItems.some(item => item.id === itemId);
  };

  const handleItemToggle = (item) => {
    let updatedItems;
    
    if (isItemSelected(item.id)) {
      updatedItems = selectedItems.filter(selectedItem => selectedItem.id !== item.id);
      const newQuantities = { ...quantities };
      delete newQuantities[item.id];
      setQuantities(newQuantities);
    } else {
      const quantity = quantities[item.id] || 1;
      updatedItems = [...selectedItems, { ...item, quantity }];
      setQuantities({ ...quantities, [item.id]: quantity });
    }
    
    onItemsChange(updatedItems);
  };

  const handleQuantityChange = (itemId, quantity) => {
    const newQuantities = { ...quantities, [itemId]: Math.max(1, quantity) };
    setQuantities(newQuantities);
    
    const updatedItems = selectedItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantities[itemId] } : item
    );
    onItemsChange(updatedItems);
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Select Items</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-6">
          {/* Search */}
          <div className="mb-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Items */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Available Items</h3>
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                {loading ? (
                  <div className="p-4 text-center">Loading items...</div>
                ) : filteredItems.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {filteredItems.map(item => (
                      <div
                        key={item.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${
                          isItemSelected(item.id) ? 'bg-primary-50 border-l-4 border-primary' : ''
                        }`}
                        onClick={() => handleItemToggle(item)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-500">{item.description}</p>
                            <p className="text-xs text-gray-400">SKU: {item.sku}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-primary">KSh {item.price?.toLocaleString()}</p>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              item.type === 'product' ? 'bg-blue-100 text-blue-800' : 
                              item.type === 'service' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {item.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No items found
                  </div>
                )}
              </div>
            </div>
            
            {/* Selected Items */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Selected Items ({selectedItems.length})
              </h3>
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                {selectedItems.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {selectedItems.map(item => (
                      <div key={item.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                          <button
                            onClick={() => handleItemToggle(item)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTimes />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Qty:</label>
                            <input
                              type="number"
                              min="1"
                              value={quantities[item.id] || 1}
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              KSh {item.price?.toLocaleString()} × {item.quantity}
                            </p>
                            <p className="font-medium text-primary">
                              KSh {(item.price * item.quantity)?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Total */}
                    <div className="p-4 bg-gray-50 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-lg font-bold text-primary">
                          KSh {calculateTotal().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No items selected
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark flex items-center gap-2 disabled:opacity-50"
            disabled={selectedItems.length === 0}
          >
            <FaCheck />
            Add Selected Items ({selectedItems.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemSelector;