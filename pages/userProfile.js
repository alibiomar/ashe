import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAuth, updatePassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaKey,
  FaBox,
  FaNewspaper,
  FaTimes,
  FaSpinner,
  FaPen,
} from "react-icons/fa";
import { toast } from "sonner";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import Head from "next/head";

const UserProfile = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUnsubscribeModalOpen, setIsUnsubscribeModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const fileInputRef = useRef(null);
  const auth = getAuth();
  const db = getFirestore();
  const router = useRouter();
  const user = auth.currentUser;

  // Redirect if no authenticated user
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Render nothing while redirecting
  if (!user) {
    return null;
  }

  useEffect(() => {
    if (!user?.uid) return;

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();

          // Get Firebase ID Token
          const idToken = await user.getIdToken();

          setUserData({
            ...data,
            avatar: data.avatar
              ? `/api/serve-image?filename=uploads/${data.avatar}&token=${idToken}`
              : null,
          });
        }
      } catch (error) {
        toast.error("Error fetching user data!");
      }
    };

    fetchUserData();
  }, [user?.uid]);

  // Fetch user orders
  useEffect(() => {
    if (!user?.uid) return;
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("userInfo.id", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        setOrders(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        toast.error("Error fetching orders!");
      }
    };
    fetchOrders();
  }, [user?.uid]);

  // Trigger file input when avatar is clicked
  const handleAvatarClick = () => {
    if (fileInputRef.current && !isUploading) {
      fileInputRef.current.click();
    }
  };

  // Handle avatar change and upload via Next.js API
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 3MB.");
      return;
    }

    // Generate preview
    const preview = URL.createObjectURL(file);
    setPreviewAvatar(preview);
    setIsUploading(true);

    try {
      // Get the current user's ID token
      const idToken = await user.getIdToken();
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        headers: {
          // Send the token in the Authorization header
          "Authorization": `Bearer ${idToken}`
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to upload avatar.");
      }

      const data = await res.json();

      // Update the avatar URL with cache-busting parameter
      setUserData((prev) => ({
        ...prev,
        avatar: `/api/serve-image?filename=uploads/${data.avatar}&token=${idToken}`,
      }));

      toast.success("Avatar updated successfully!");
    } catch (error) {
      toast.error(error.message || "Error uploading avatar.");
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(preview); // Clean up preview
    }
  };

  const handleChangePassword = async (newPassword) => {
    try {
      await updatePassword(auth.currentUser, newPassword);
      toast.success("Password updated successfully!");
      setIsPasswordModalOpen(false);
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        toast.error("You need to log in again before changing your password.");
      } else {
        toast.error(error.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  return (
    <Layout>
      <Head>
        <title>My Account</title>
      </Head>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto p-4 md:p-6 lg:p-8 max-w-4xl w-full min-h-screen space-y-8"
      >
        {/* Profile Card */}
        <div className="bg-white p-6 flex flex-col justify-between md:flex-row md:items-center items-center md:gap-6 gap-10 transition-all">
          <div className="flex md:flex-row items-center gap-8 md:gap-8 justify-center">
            {/* Clickable Avatar with Hover Indication */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={handleAvatarClick}
              className="relative cursor-pointer flex flex-col items-center"
            >
              <div className="relative">
                {previewAvatar || userData?.avatar ? (
                  <img
                    src={previewAvatar || userData.avatar}
                    alt="User Avatar"
                    className="w-20 h-20 rounded-full object-cover shadow-md transition-all duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      setUserData((prev) => ({ ...prev, avatar: null }));
                    }}
                  />
                ) : (
                  <FaUserCircle className="text-gray-400" size={80} />
                )}
                {/* Pen Icon Overlay */}
                <div className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-sm transition-opacity duration-300">
                  <FaPen className="text-gray-600" size={16} />
                </div>
                {/* Uploading Spinner */}
                {isUploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <FaSpinner className="animate-spin text-white mb-1" size={24} />
                    <span className="text-white text-xs mt-1">Processing...</span>
                  </div>
                )}
              </div>
              {/* Light Text Prompt */}
              <span className="text-sm text-gray-400 mt-2 opacity-100 ">
                Edit image.
              </span>
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleAvatarChange}
                accept="image/*"
              />
            </motion.div>
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 uppercase">
                {userData?.firstName} {userData?.lastName}
              </h1>
              <p className="text-sm md:text-base text-gray-500 font-medium">
                {auth.currentUser?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-10/12 justify-center md:w-40 items-center p-4 md:p-5 bg-highlight  hover:bg-accent transition-all"
          >
            <FaSignOutAlt className="mr-4 text-white" size={24} />
            <span className="text-white font-semibold">Logout</span>
          </button>
        </div>

        {/* Actions Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex items-center p-4 md:p-5 bg-white border  transition-all hover:bg-light"
          >
            <FaKey className="mr-4 text-accent" size={24} />
            <span className="text-gray-700 font-semibold text-left">
              Change Password
              <span className="block text-sm text-gray-400 font-normal mt-1">
                Update your account security
              </span>
            </span>
          </button>

          <button
            onClick={() => setIsUnsubscribeModalOpen(true)}
            className="flex items-center p-4 md:p-5 bg-white border  transition-all hover:bg-light"
          >
            <FaNewspaper className="mr-4 text-accent" size={24} />
            <span className="text-gray-700 font-semibold text-left">
              Newsletter Settings
              <span className="block text-sm text-gray-400 font-normal mt-1">
                Manage email preferences
              </span>
            </span>
          </button>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="text-xl font-bold text-gray-900 flex items-center mb-4">
            <FaBox className="mr-3 text-accent" />
            Order History
          </h3>
          <div className="overflow-x-auto">
            {orders.length > 0 ? (
              <table className="w-full min-w-[500px]">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => {
                    const shortOrderId = order.id.slice(0, 6);
                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="cursor-pointer hover:bg-light transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                          {shortOrderId}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-highlight text-white">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">No orders found</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <ModalWrapper onClose={() => setIsPasswordModalOpen(false)}>
            <PasswordChangeModal
              setIsPasswordModalOpen={setIsPasswordModalOpen}
              handleChangePassword={handleChangePassword}
            />
          </ModalWrapper>
        )}
        {isUnsubscribeModalOpen && (
          <ModalWrapper onClose={() => setIsUnsubscribeModalOpen(false)}>
            <UnsubscribeModal
              user={auth.currentUser}
              setIsModalOpen={setIsUnsubscribeModalOpen}
            />
          </ModalWrapper>
        )}
        {selectedOrder && (
          <ModalWrapper onClose={() => setSelectedOrder(null)}>
            <OrderModal
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
            />
          </ModalWrapper>
        )}
      </AnimatePresence>
    </Layout>
  );
};

const ModalWrapper = ({ children, onClose }) => {
  const modalRef = useRef();

  // Disable background scrolling when modal is open
  useEffect(() => {
    // Save the current overflow style
    const originalStyle = window.getComputedStyle(document.body).overflow;
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Restore original overflow style when modal closes
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
      style={{ pointerEvents: "auto" }} // Ensures modal captures interactions
    >
      <div 
        ref={modalRef} 
        className="relative bg-white rounded-md shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-light rounded-full transition-colors z-10"
        >
          <FaTimes className="text-accent" size={20} />
        </button>
        <div className="p-6 md:p-8 overflow-y-auto">{children}</div>
      </div>
    </motion.div>
  );
};

const PasswordChangeModal = ({ setIsPasswordModalOpen, handleChangePassword }) => {
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async () => {
    if (!newPassword) return toast.warning("Please enter a new password.");
    await handleChangePassword(newPassword);
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-highlight/10 ">
          <FaKey className="text-highlight" size={24} />
        </div>
        <h3 className="text-2xl font-bold text-dark">Change Password</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <div className="relative">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-3 border border-gray-300  focus:ring-2 focus:ring-highlight focus:border-highlight outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsPasswordModalOpen(false)}
            className="px-5 py-2.5 text-gray-600 hover:text-dark hover:bg-light  transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-highlight text-white  hover:bg-highlight/90 transition-colors font-medium"
          >
            Update Password
          </button>
        </div>
      </div>
    </>
  );
};

const UnsubscribeModal = ({ user, setIsModalOpen }) => {
  const db = getFirestore();

  const handleUnsubscribe = async () => {
    if (!user?.email) return;

    try {
      const signupsRef = collection(db, "newsletter_signups");
      const q = query(signupsRef, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.warning("You are not subscribed to the newsletter.");
        setIsModalOpen(false);
        return;
      }

      querySnapshot.forEach(async (docSnapshot) => {
        await deleteDoc(doc(db, "newsletter_signups", docSnapshot.id));
      });

      toast.success("You have successfully unsubscribed.");
      setIsModalOpen(false);
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-red-100 ">
          <FaNewspaper className="text-red-600" size={24} />
        </div>
        <h3 className="text-2xl font-bold text-dark">Newsletter Settings</h3>
      </div>

      <div className="space-y-6">
        <p className="text-gray-600 leading-relaxed">
          You're about to unsubscribe from our newsletter. This means you'll no longer receive:
          <ul className="list-disc list-inside mt-2 text-gray-500 space-y-1">
            <li>Product updates</li>
            <li>Exclusive offers</li>
            <li>Latest news</li>
          </ul>
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-5 py-2.5 text-gray-600 hover:text-dark hover:bg-light  transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUnsubscribe}
            className="px-5 py-2.5 bg-red-600 text-white  hover:bg-red-700 transition-colors font-medium"
          >
            Unsubscribe
          </button>
        </div>
      </div>
    </>
  );
};

const OrderModal = ({ order, onClose }) => {
  const shipping = order?.shippingInfo || {};
  const items = order?.items || [];
  const shortOrderId = order?.id?.slice(0, 6) || '';

  return (
    <>
      <div className="flex items-center gap-3 mb-6 overflow-scroll">
        <div className="p-3 bg-highlight/10 ">
          <FaBox className="text-highlight" size={24} />
        </div>
        <h3 className="text-2xl font-bold text-dark">Order Details</h3>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-medium text-dark">{shortOrderId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Order Date</p>
            <p className="font-medium text-dark">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className="inline-block px-2.5 py-1 text-sm font-medium bg-highlight text-white rounded-full">
              {order.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="font-medium text-dark">{order.totalAmount} TND</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="text-lg font-semibold text-dark mb-4">Shipping Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Address</p>
              <p className="text-dark">{shipping.addressLine}</p>
            </div>
            <div>
              <p className="text-gray-500">District</p>
              <p className="text-dark">{shipping.district}</p>
            </div>
            <div>
              <p className="text-gray-500">Delegation</p>
              <p className="text-dark">{shipping.delegation}</p>
            </div>
            <div>
              <p className="text-gray-500">Governorate</p>
              <p className="text-dark">{shipping.governorate}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="text-lg font-semibold text-dark mb-4">Order Items</h4>
          <div className="border  overflow-hidden">
            <table className="w-full">
              <thead className="bg-light">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Size</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-sm text-dark">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.size || "-"}</td>
                    <td className="px-4 py-3 text-sm text-dark">{item.price} TND</td>
                    <td className="px-4 py-3 text-sm text-dark">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;