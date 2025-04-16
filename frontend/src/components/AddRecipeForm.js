import React, { useState } from 'react';
import axios from 'axios';
import { FiPlusCircle } from 'react-icons/fi';

const AddRecipeForm = () => {
  const [recipeName, setRecipeName] = useState('');
  const [newRecipe, setNewRecipe] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipeName) return;
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/recipes`, { name: recipeName }, {
        headers: {
          'authorization': `Bearer ${token}`
        }
      });
      setNewRecipe(data);
      setError('');
    } catch (err) {
      console.error('Error adding recipe', err);
      setError('Error adding recipe. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          className="input input-bordered flex-1"
          placeholder="Enter new recipe name"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          <FiPlusCircle className="mr-2" /> Add Recipe
        </button>
      </form>
      
      {error && (
  <p className="bg-red-100 text-red-800 p-3 rounded-md border border-red-300 shadow-sm">
    {error}
  </p>
)}
      
      {newRecipe && (
        <div className="card bg-success text-success-content p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎉</span>
            <h3 className="text-lg font-bold">Successfully Added!</h3>
          </div>
          <div className="bg-base-100 rounded-lg p-4">
            <h4 className="font-bold mb-2">{newRecipe.name}</h4>
            <ul className="list-disc pl-6">
              {newRecipe.ingredients.map((ing, index) => (
                <li key={index} className="text-sm">
                  {ing.quantity && <span className="font-mono">{ing.quantity}</span>}
                  {ing.unit} {ing.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddRecipeForm;
