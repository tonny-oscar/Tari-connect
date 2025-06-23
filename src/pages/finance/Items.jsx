import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { getItems, createItem, updateItem, deleteItem } from '../../services/itemService';
import { FaBoxOpen, FaPlus, FaSearch, FaEdit, FaTrash } from 'react-icons/fa';

const Items = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    price: '',
    type: 'product',
    category: '',
    unit: 'piece'
  });

  useEffect(() => {
    if (user?.uid) {
      fetchItems();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchItems = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const result = await getItems(user.uid);
      if (result.success) {
        setItems(result.items || []);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Error in fetchItems:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid) {
      alert('User not authenticated');
      return;
    }
    
    setSubmitting(true);
    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price) || 0
      };
      
      let result;
      if (editingItem) {
        result = await updateItem(editingItem.id, itemData);
      } else {
        result = await createItem(itemData, user.uid);
      }
      
      if (result.success) {
        await fetchItems();
        resetForm();
        alert(`Item ${editingItem ? 'updated' : 'created'} successfully!`);
      } else {
        alert(`Error ${editingItem ? 'updating' : 'creating'} item: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      sku: item.sku || '',
      price: item.price?.toString() || '',
      type: item.type || 'product',
      category: item.category || '',
      unit: item.unit || 'piece'
    });
    setShowForm(true);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const result = await deleteItem(itemId);
        if (result.success) {
          await fetchItems();
          alert('Item deleted successfully!');
        } else {
          alert('Error deleting item: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('An error occurred while deleting the item.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      sku: '',
      price: '',
      type: 'product',
      category: '',
      unit: 'piece'
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const filteredItems = items.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaBoxOpen className="text-primary" />
            Items
          </h1>
          <p className="text-gray-600">Manage your products and services</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary-dark transition-colors"
        >
          <FaPlus />
          Add Item
        </button>
      </div>
      
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
      
      {/* Items list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading items...</p>
          </div>
        ) : !user ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Please log in to view items.</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      {item.category && <div className="text-sm text-gray-500">{item.category}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="line-clamp-2">{item.description || 'No description'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.sku || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      KSh {item.price?.toLocaleString() || '0'}
                      {item.unit && <span className="text-xs text-gray-500 ml-1">/{item.unit}</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.type === 'product' ? 'bg-primary/10 text-primary' :
                        item.type === 'service' ? 'bg-accent/10 text-accent' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {item.type || 'product'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-primary hover:text-primary-dark"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <FaBoxOpen className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search term' : 'Add your first item to get started'}
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 mx-auto hover:bg-primary-dark transition-colors"
            >
              <FaPlus />
              Add Item
            </button>
          </div>
        )}
      </div>

      {/* Item Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    required
                    disabled={submitting}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    rows="3"
                    disabled={submitting}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      disabled={submitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Price (KSh) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      disabled={submitting}
                    >
                      <option value="product">Product</option>
                      <option value="service">Service</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Unit
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      disabled={submitting}
                    >
                      <option value="piece">Piece</option>
                      <option value="hour">Hour</option>
                      <option value="day">Day</option>
                      <option value="month">Month</option>
                      <option value="kg">Kilogram</option>
                      <option value="meter">Meter</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    disabled={submitting}
                  />
                </div>
                
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : (editingItem ? 'Update Item' : 'Create Item')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;