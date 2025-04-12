import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { doc, getDoc, setDoc, onSnapshot, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import Cookies from "js-cookie";
import { toast } from "sonner";

const BasketContext = createContext();

export const useBasket = () => useContext(BasketContext);

export const BasketProvider = ({ children }) => {
  const [basketItems, setBasketItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const basketCount = useMemo(
    () => basketItems.reduce((total, item) => total + item.quantity, 0),
    [basketItems]
  );

  const loadBasketFromCookies = useCallback(() => {
    const cookieBasket = Cookies.get("basket")
      ? JSON.parse(Cookies.get("basket"))
      : [];
    setBasketItems(cookieBasket);
    return cookieBasket;
  }, []);

  const updateBasketData = useCallback(
    async (newBasket) => {
      try {
        if (user) {
          const basketRef = doc(db, "baskets", user.uid);
          await setDoc(basketRef, { items: newBasket }, { merge: true });
        } else {
          Cookies.set("basket", JSON.stringify(newBasket), { expires: 7 });
        }
        setBasketItems(newBasket);
        return true;
      } catch (error) {
        toast.error("Error updating basket");
        return false;
      }
    },
    [user]
  );

  const getItemQuantity = useCallback(
    (productId, size, color) => {
      const item = basketItems.find(
        (item) => item.id === productId && item.size === size && item.color === color
      );
      return item ? item.quantity : 0;
    },
    [basketItems]
  );

  const addItemToBasket = useCallback(
    async (product) => {
      const newBasket = [...basketItems];
      const existingIndex = newBasket.findIndex(
        (item) =>
          item.id === product.id && item.size === product.size && item.color === product.color
      );

      if (existingIndex >= 0) {
        newBasket[existingIndex].quantity += 1;
      } else {
        newBasket.push({ ...product, quantity: 1 });
      }

      const success = await updateBasketData(newBasket);
      if (success) {
        toast.success(`${product.name} added to your basket!`);
      }
    },
    [basketItems, updateBasketData]
  );

  const removeItemFromBasket = useCallback(
    async (itemId, itemSize, itemColor) => {
      const updatedBasket = basketItems.filter(
        (item) =>
          !(item.id === itemId && item.size === itemSize && item.color === itemColor)
      );
      const success = await updateBasketData(updatedBasket);
      if (!success) {
        toast.error("Error removing item from basket");
      }
    },
    [basketItems, updateBasketData]
  );

  const updateItemQuantity = useCallback(
    async (itemId, itemSize, itemColor, newQuantity) => {
      if (newQuantity < 1) {
        return removeItemFromBasket(itemId, itemSize, itemColor);
      }

      try {
        const productRef = doc(db, "products", itemId);
        const productSnapshot = await getDoc(productRef);

        if (!productSnapshot.exists()) {
          toast.error("Product not found");
          return;
        }

        const productData = productSnapshot.data();
        const selectedColorData = productData.colors.find(
          (color) => color.name === itemColor
        );
        if (!selectedColorData) {
          toast.error("Color not found");
          return;
        }

        const availableStock = selectedColorData.stock?.[itemSize] || 0;
        if (newQuantity > availableStock) {
          toast.error(
            `No more items available in size ${itemSize} for color ${itemColor}`
          );
          return;
        }

        const updatedBasket = basketItems.map((item) =>
          item.id === itemId && item.size === itemSize && item.color === itemColor
            ? { ...item, quantity: newQuantity }
            : item
        );

        await updateBasketData(updatedBasket);
      } catch (error) {
        toast.error("Error updating item quantity");
      }
    },
    [basketItems, removeItemFromBasket, updateBasketData]
  );

  const clearBasket = useCallback(async () => {
    try {
      if (user) {
        const basketRef = doc(db, "baskets", user.uid);
        await setDoc(basketRef, { items: [] }, { merge: true });
      }
      Cookies.remove("basket");
      setBasketItems([]);
    } catch (error) {
      toast.error("Error clearing basket");
    }
  }, [user]);

  const syncBasketWithFirestore = useCallback(
    async (userId) => {
      try {
        const cookieBasket = loadBasketFromCookies();
        if (cookieBasket.length === 0) return;

        const basketRef = doc(db, "baskets", userId);
        const basketDoc = await getDoc(basketRef);
        const firestoreBasket = basketDoc.exists() ? basketDoc.data().items || [] : [];

        // Fetch all product IDs in one query to reduce Firestore calls
        const productIds = [...new Set(cookieBasket.map((item) => item.id))];
        const productsQuery = query(
          collection(db, "products"),
          where("__name__", "in", productIds.length ? productIds : ["placeholder"])
        );
        const productsSnapshot = await getDocs(productsQuery);
        const productsMap = new Map(
          productsSnapshot.docs.map((doc) => [doc.id, doc.data()])
        );

        const mergedBasket = [...firestoreBasket];

        for (const cookieItem of cookieBasket) {
          const productData = productsMap.get(cookieItem.id);
          if (!productData) continue;

          const selectedColorData = productData.colors.find(
            (color) => color.name === cookieItem.color
          );
          if (!selectedColorData) continue;

          const availableStock = selectedColorData.stock?.[cookieItem.size] || 0;
          const existingIndex = mergedBasket.findIndex(
            (item) =>
              item.id === cookieItem.id &&
              item.size === cookieItem.size &&
              item.color === cookieItem.color
          );

          if (existingIndex >= 0) {
            const newQuantity =
              mergedBasket[existingIndex].quantity + cookieItem.quantity;
            mergedBasket[existingIndex].quantity = Math.min(newQuantity, availableStock);
          } else {
            const quantity = Math.min(cookieItem.quantity, availableStock);
            mergedBasket.push({ ...cookieItem, quantity });
          }
        }

        await setDoc(basketRef, { items: mergedBasket }, { merge: true });
        Cookies.remove("basket");
        setBasketItems(mergedBasket);
      } catch (error) {
        toast.error("Error syncing basket");
      }
    },
    [loadBasketFromCookies]
  );

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await syncBasketWithFirestore(currentUser.uid);
        const basketRef = doc(db, "baskets", currentUser.uid);
        const basketUnsubscribe = onSnapshot(basketRef, (snapshot) => {
          setBasketItems(snapshot.exists() ? snapshot.data().items || [] : []);
          setLoading(false);
        });
        return () => basketUnsubscribe();
      } else {
        loadBasketFromCookies();
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [syncBasketWithFirestore, loadBasketFromCookies]);

  const value = useMemo(
    () => ({
      basketItems,
      basketCount,
      loading,
      getItemQuantity,
      addItemToBasket,
      removeItemFromBasket,
      updateItemQuantity,
      clearBasket,
      loadBasketFromCookies,
    }),
    [
      basketItems,
      basketCount,
      loading,
      getItemQuantity,
      addItemToBasket,
      removeItemFromBasket,
      updateItemQuantity,
      clearBasket,
      loadBasketFromCookies,
    ]
  );

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
};

export default BasketContext;