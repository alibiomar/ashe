import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAuth, updatePassword } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { FaUserCircle, FaSignOutAlt, FaKey, FaBox, FaTimes } from "react-icons/fa";
import { toast } from "sonner";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import Head from 'next/head';

const UserProfile = () => {
  const [orders, setOrders] = useState([]);
  const [isUnsubscribeModalOpen, setIsUnsubscribeModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const menuRef = useRef(null);
  const auth = getAuth();
  const db = getFirestore();
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user?.uid) return;
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, "orders"), where("userInfo.id", "==", user.uid));
        const querySnapshot = await getDocs(q);
        setOrders(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        toast.error("Error fetching orders!");
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, [auth.currentUser]);

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
        <div className="bg-white p-6 flex flex-col justify-between md:flex-row items-start md:items-center gap-6  transition-all">
          <div className="flex md:flex-row flex-col items-center gap-4 md:gap-6">
          <FaUserCircle className="text-gray-400 shrink-0" size={80} />
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {auth.currentUser?.firstName} {auth.currentUser?.lastName}
            </h1>
            <p className="text-sm md:text-base text-gray-500 font-medium">
              {auth.currentUser?.email}
            </p>
          </div></div>
          <button
            onClick={handleLogout}
            className="group flex items-center p-4 md:p-5 bg-[#46c7c7] rounded-sm hover:bg-gray-400 transition-all md:col-span-2"
          >
            <FaSignOutAlt className="mr-4 text-white   transition-colors" size={24} />
            <span className=" transition-colors text-white font-semibold">
              Logout
            </span>
          </button>
        </div>

        {/* Actions Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="group flex items-center p-4 md:p-5 bg-white  border   rounded-md  transition-all"
          >
            <FaKey className="mr-4 text-gray-500 group-hover:text-gray-700 transition-colors" size={24} />
            <span className="text-gray-700 font-semibold text-left">
              Change Password
              <span className="block text-sm text-gray-400 font-normal mt-1">
                Update your account security
              </span>
            </span>
          </button>

          <button
            onClick={() => setIsUnsubscribeModalOpen(true)}
            className="group flex items-center p-4 md:p-5 bg-white  border  rounded-md   transition-all"
          >
            <FaBox className="mr-4 text-gray-500 group-hover:text-gray-700 transition-colors" size={24} />
            <span className="text-gray-700 font-semibold text-left">
              Newsletter Settings
              <span className="block text-sm text-gray-400 font-normal mt-1">
                Manage email preferences
              </span>
            </span>
          </button>


        </div>

        {/* Order History */}
        <div className="bg-white rounded-xl  p-6 border ">
          <h3 className="text-xl font-bold text-gray-900 flex items-center mb-4">
            <FaBox className="mr-3 text-gray-500" />
            Order History
          </h3>
          <div className="overflow-x-auto">
            {orders.length > 0 ? (
              <table className="w-full min-w-[500px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Order ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600 font-medium">{order.id}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
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
          <PasswordChangeModal
            setIsPasswordModalOpen={setIsPasswordModalOpen}
            handleChangePassword={handleChangePassword}
          />
        )}
        {isUnsubscribeModalOpen && (
          <UnsubscribeModal user={auth.currentUser} setIsModalOpen={setIsUnsubscribeModalOpen} />
        )}
      </AnimatePresence>
    </Layout>
  );
};

// PasswordChangeModal Component
const PasswordChangeModal = ({ setIsPasswordModalOpen, handleChangePassword }) => {
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async () => {
    if (!newPassword) return toast.warning("Please enter a new password.");
    await handleChangePassword(newPassword);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <button
          onClick={() => setIsPasswordModalOpen(false)}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaTimes className="text-gray-500" size={20} />
        </button>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-2.5  border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-5 py-2.5 text-gray-600 hover:bg-gray-50  transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-blue-600 text-white hover:bg-blue-700  transition-colors"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// UnsubscribeModal Component
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
      console.error("Error unsubscribing:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaTimes className="text-gray-500" size={20} />
        </button>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Unsubscribe from Newsletter</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to stop receiving our newsletters? You can resubscribe anytime.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-5 py-2.5 text-gray-600 hover:bg-gray-50  transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUnsubscribe}
            className="px-5 py-2.5 bg-red-600 text-white hover:bg-red-700  transition-colors"
          >
            Unsubscribe
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;