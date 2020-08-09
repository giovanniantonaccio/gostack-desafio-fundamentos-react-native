import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

const STORAGE_KEY = '@products';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      try {
        const storedValues = await AsyncStorage.getItem(STORAGE_KEY);
        setProducts(
          storedValues !== null ? JSON.parse(storedValues) : ([] as Product[]),
        );
      } catch (e) {
        console.error(e);
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const index = products.findIndex(previous => previous.id === id);
      const newProducts = [...products];
      newProducts[index].quantity += 1;

      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
        setProducts(newProducts);
      } catch (e) {
        console.error(e);
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const index = products.findIndex(previous => previous.id === id);
      const newProducts = [...products];
      if (newProducts[index].quantity - 1 <= 0) {
        newProducts.splice(index, 1);
      } else {
        newProducts[index].quantity -= 1;
      }

      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
        setProducts(newProducts);
      } catch (e) {
        console.error(e);
      }
    },
    [products],
  );

  const addToCart = useCallback(
    async (product: Product) => {
      const index = products.findIndex(previous => previous.id === product.id);
      const newProducts = [...products];
      if (index !== -1) {
        newProducts[index].quantity += 1;
      } else {
        newProducts.push({ ...product, quantity: 1 });
      }

      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
        setProducts(newProducts);
      } catch (e) {
        console.error(e);
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
