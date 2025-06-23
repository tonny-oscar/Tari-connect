import React, { useState, useEffect } from 'react';
import { getPricingPlans, updatePricingPlan, formatPrice } from '../../services/pricingService';
import { FaEdit, FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';

const PricingManager = () => {
  const [plans, setPlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch pricing plans
  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      const { success, plans, error } = await getPricingPlans();
      
      if (success) {
        setPlans(plans);
      } else {
        setError(error || 'Failed to load pricing plans');
      }
      
      setIsLoading(false);
    };
    
    fetchPlans();
  }, []);

  // Start editing a plan
  const handleEdit = (plan) => {
    setEditingPlan({
      ...plan,
      features: [...plan.features]
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingPlan(null);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      setEditingPlan({
        ...editingPlan,
        [name]: parseInt(value) || 0
      });
    } else {
      setEditingPlan({
        ...editingPlan,
        [name]: value
      });
    }
  };

  // Handle feature change
  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...editingPlan.features];
    updatedFeatures[index] = value;
    
    setEditingPlan({
      ...editingPlan,
      features: updatedFeatures
    });
  };

  // Add new feature
  const handleAddFeature = () => {
    setEditingPlan({
      ...editingPlan,
      features: [...editingPlan.features, '']
    });
  };

  // Remove feature
  const handleRemoveFeature = (index) => {
    const updatedFeatures = [...editingPlan.features];
    updatedFeatures.splice(index, 1);
    
    setEditingPlan({
      ...editingPlan,
      features: updatedFeatures
    });
  };

  // Save plan changes
  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const { success, error } = await updatePricingPlan(editingPlan.id, {
        name: editingPlan.name,
        price: editingPlan.price,
        currency: editingPlan.currency,
        billingPeriod: editingPlan.billingPeriod,
        description: editingPlan.description,
        features: editingPlan.features,
        isPopular: editingPlan.isPopular,
        order: editingPlan.order
      });
      
      if (success) {
        // Update local state
        setPlans(plans.map(plan =>
          plan.id === editingPlan.id ? editingPlan : plan
        ));
        
        setSuccess('Pricing plan updated successfully');
        setEditingPlan(null);
      } else {
        setError(error || 'Failed to update pricing plan');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error saving plan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && plans.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Pricing Management</h2>
        <p className="text-sm text-gray-500">Update your pricing plans</p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 m-4 rounded">
          {success}
        </div>
      )}
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div 
              key={plan.id} 
              className={`border rounded-lg overflow-hidden ${
                plan.isPopular ? 'border-blue-500 shadow-lg' : 'border-gray-200'
              }`}
            >
              <div className={`p-4 ${plan.isPopular ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <button
                    onClick={() => handleEdit(plan)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit plan"
                  >
                    <FaEdit />
                  </button>
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{formatPrice(plan.price, plan.currency)}</span>
                  <span className="text-gray-500">/{plan.billingPeriod}</span>
                </div>
                <p className="text-gray-600 mt-2">{plan.description}</p>
              </div>
              
              <div className="p-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Edit Pricing Plan</h3>
              <button 
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editingPlan.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (KSh)</label>
                  <input
                    type="number"
                    name="price"
                    value={editingPlan.price}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <input
                    type="text"
                    name="currency"
                    value={editingPlan.currency}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Billing Period</label>
                  <select
                    name="billingPeriod"
                    value={editingPlan.billingPeriod}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={editingPlan.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Popular Plan</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPopular"
                      checked={editingPlan.isPopular}
                      onChange={(e) => setEditingPlan({...editingPlan, isPopular: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Mark as popular plan</label>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Features</label>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                  >
                    <FaPlus />
                  </button>
                </div>
                
                {editingPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="flex-1 p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="mr-2 px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : (
                    <>
                      <FaSave />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingManager;