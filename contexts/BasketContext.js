import { createContext, useState, useContext } from 'react';

// Create BasketContext
const BasketContext = createContext();

// Create a custom hook to use the BasketContext
export const useBasket = () => useContext(BasketContext);

// Create the BasketProvider component
export const BasketProvider = ({ children }) => {
  const [basketItems, setBasketItems] = useState([]);

  // Function to add an item to the basket
  const addItemToBasket = (item) => {
    setBasketItems((prevItems) => {
      // Check if the item already exists in the basket
      const existingItem = prevItems.find((i) => i.id === item.id && i.size === item.size);

      if (existingItem) {
        // If it exists, increase the quantity
        return prevItems.map((i) =>
          i.id === item.id && i.size === item.size ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        // If it doesn't exist, add the new item to the basket
        return [...prevItems, item];
      }
    });
  };

  // Function to remove an item from the basket
  const removeItemFromBasket = (itemId, itemSize) => {
    setBasketItems((prevItems) => prevItems.filter((item) => !(item.id === itemId && item.size === itemSize)));
  };

  // Function to update the quantity of an item
  const updateItemQuantity = (itemId, itemSize, quantity) => {
    setBasketItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId && item.size === itemSize ? { ...item, quantity } : item
      )
    );
  };

  return (
    <BasketContext.Provider value={{ basketItems, addItemToBasket, removeItemFromBasket, updateItemQuantity }}>
      {children}
    </BasketContext.Provider>
  );
};
