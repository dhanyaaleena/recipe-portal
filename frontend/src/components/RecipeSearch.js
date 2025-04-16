// RecipeSearch.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiX, FiPlusCircle, FiLoader, FiShoppingCart } from 'react-icons/fi';

const RecipeSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [error, setError] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem('authToken');

  // Debounce search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length > 2) {
        setIsLoading(true);
        try {
          const { data } = await axios.get(
            `${process.env.REACT_APP_API_URL}/recipes?search=${searchTerm}`,
            {
              headers: { authorization: `Bearer ${token}` }
            }
          );
          setSuggestions(data);
        } catch (error) {
          console.error('Error fetching recipes', error);
          setError('Failed to fetch recipes');
        }
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, token]);

  const handleAddNewRecipe = async () => {
    if (isAdding || !searchTerm.trim()) return;
    
    setIsAdding(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/recipes`,
        { name: searchTerm.trim() },
        { headers: { authorization: `Bearer ${token}` } }
      );
      
      setSelectedRecipes(prev => [...prev, data]);
      setSearchTerm('');
      setSuggestions([]);
      setError('');
    } catch (err) {
      console.error('Error adding recipe', err);
      setError(err.response?.data?.message || 'Error adding recipe');
    }
    setIsAdding(false);
  };

  const selectRecipe = async (recipeId) => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/recipes/${recipeId}`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      if (selectedRecipes.some(r => r._id === data._id)) return;
      if (selectedRecipes.length >= 4) {
        alert('Maximum of 4 recipes allowed');
        return;
      }
      setSelectedRecipes(prev => [...prev, data]);
      setSearchTerm('');
      setSuggestions([]);
    } catch (error) {
      console.error('Error fetching recipe details', error);
    }
  };

  const removeRecipe = (recipeId) => {
    setSelectedRecipes(prev => prev.filter(r => r._id !== recipeId));
  };

  const consolidatedIngredients = selectedRecipes.reduce((acc, recipe) => {
    recipe.ingredients.forEach(ing => {
      const name = ing.name.trim().toLowerCase();
      const unit = ing.unit?.trim().toLowerCase() || '';
      const key = `${name}-${unit}`;
  
      const qty = parseFloat(ing.quantity);
      const validQty = !isNaN(qty) ? qty : null;
  
      if (!acc[key]) {
        acc[key] = {
          ...ing,
          name: ing.name.trim(), // Preserve original formatting
          unit: ing.unit?.trim(),
          quantity: validQty,
        };
      } else {
        if (validQty !== null) {
          acc[key].quantity =
            acc[key].quantity === null ? validQty : acc[key].quantity + validQty;
        }
      }
    });
    return acc;
  }, {});  

  const ingredientList = Object.values(consolidatedIngredients);

  return (
    <div className="space-y-6">
      <div className="form-control relative">
        <div className="join w-full">
          <input
            type="text"
            className="input input-bordered join-item w-full bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for recipes..."
            aria-label="Recipe search"
          />
          <button className="btn btn-primary join-item bg-primary hover:bg-primary/90 text-white transition-all">
            {isLoading ? (
              <FiLoader className="animate-spin text-xl" />
            ) : (
              <FiSearch className="text-xl" />
            )}
          </button>
        </div>
      </div>

      {error && (
  <p className="bg-red-100 text-red-800 p-3 rounded-md border border-red-300 shadow-sm">
    {error}
  </p>
)}

      {searchTerm.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          {suggestions.length > 0 ? (
            <ul className="menu">
              {suggestions.map(recipe => (
                <li key={recipe._id}>
                  <button 
                    className="flex justify-between items-center p-4 hover:bg-gray-50 text-gray-800 transition-colors"
                    onClick={() => selectRecipe(recipe._id)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{recipe.name}</div>
                      <div className="text-sm text-gray-500">{recipe.category}</div>
                    </div>
                    <div className="badge badge-outline bg-gray-100 text-gray-600 border-gray-200">
                      {recipe.cuisine}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <button
              className={`w-full p-4 text-left flex justify-between items-center text-gray-800 transition-colors ${
                isAdding ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
              }`}
              onClick={handleAddNewRecipe}
              disabled={isAdding}
            >
              <div>
                <div className="font-medium">
                  {isAdding ? "Creating recipe..." : `Add "${searchTerm.trim()}"`}
                </div>
                <div className="text-sm text-gray-500">New recipe</div>
              </div>
              {!isAdding && <FiPlusCircle className="text-xl text-primary/80" />}
            </button>
          )}
        </div>
      )}

      {selectedRecipes.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {selectedRecipes.map(recipe => (
              <div 
                key={recipe._id} 
                className="badge badge-lg gap-2 bg-primary/10 text-primary/90 hover:bg-primary/20 border border-primary/20 transition-colors"
              >
                {recipe.name}
                <FiX 
                  className="cursor-pointer hover:text-red-600/90" 
                  onClick={() => removeRecipe(recipe._id)}
                />
              </div>
            ))}
          </div>

          <div className="card bg-white shadow-xl border border-gray-200">
            <div className="card-body">
              <h3 className="card-title text-gray-800">
                <FiShoppingCart className="mr-2 text-primary/80" />
                Combined Grocery List
              </h3>
              <div className="divider my-2"></div>
              <ul className="space-y-3">
                {ingredientList.map((ing, index) => (
                  <li 
                  key={index} 
                  className="flex items-center gap-4 p-3 rounded-lg transition-all bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 shadow-sm"
                >
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-primary checkbox-sm border-gray-300 checked:border-primary/80" 
                    />
                    <div className="flex-1">
                      <div className="font-medium">{ing.name}</div>
                      {ing.notes && (
                        <div className="text-sm text-gray-500">{ing.notes}</div>
                      )}
                    </div>
                    {ing.quantity !== null && (
                      <div className="badge badge-outline bg-gray-50 border-gray-200 text-gray-700">
                        {ing.quantity} {ing.unit}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeSearch;