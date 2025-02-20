import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAuth, updatePassword } from "firebase/auth";
import { getFirestore, collection,getDoc, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
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
  const user = auth.currentUser;
const [userData, setUserData] = useState(null);
  useEffect(() => {
    if (!user?.uid) return;
  
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserData(userData); // Assuming you have a state to store user data
        }
      } catch (error) {
        toast.error("Error fetching user data!");
      }
    };
  
    fetchUserData();
  }, [user?.uid]);
  
  useEffect(() => {
    if (!user?.uid) return;
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, "orders"), where("userInfo.id", "==", user.uid));
        const querySnapshot = await getDocs(q);
        setOrders(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        toast.error("Error fetching orders!");
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
        <div className="bg-white p-6 flex flex-col justify-between md:flex-row md:items-center items-center md:gap-6 gap-10  transition-all">
          <div className="flex md:flex-row  items-center gap-8 md:gap-8 md:justify-center">
          <FaUserCircle className="text-gray-400 shrink-0" size={80} />
            <div className="space-y-2 ">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 uppercase">
              {userData?.firstName} {userData?.lastName}
            </h1>
            <p className="text-sm md:text-base text-gray-500 font-medium">
              {auth.currentUser?.email}
            </p>
          </div></div>
          <button
            onClick={handleLogout}
            className="flex w-10/12 justify-center md:w-40  items-center p-4 md:p-5 bg-[#46c7c7] rounded-md md:rounded-sm hover:bg-accent transition-all "
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

const PasswordChangeModal = ({ setIsPasswordModalOpen, handleChangePassword }) => {
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async () => {
    if (!newPassword) return toast.warning("Please enter a new password.");
    await handleChangePassword(newPassword);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div className="relative bg-white rounded-lg shadow-sm w-full max-w-md p-6 md:p-8">
        <button
          onClick={() => setIsPasswordModalOpen(false)}
          className="absolute top-3 right-3 p-2 hover:bg-gray-50 rounded-md transition-colors"
        >
          <FaTimes className="text-gray-400" size={18} />
        </button>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-600 mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="px-5 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 bg-highlight text-white rounded-md hover:bg-accent transition-colors"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div className="relative bg-white rounded-lg shadow-sm w-full max-w-md p-6 md:p-8">
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-3 right-3 p-2 hover:bg-gray-50 rounded-md transition-colors"
        >
          <FaTimes className="text-gray-400" size={18} />
        </button>

        <h3 className="text-xl font-semibold text-gray-900 mb-4">Unsubscribe</h3>
        
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          You'll stop receiving our newsletters. Resubscribe anytime.
        </p>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-5 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUnsubscribe}
            className="px-5 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </motion.div>
  );
};


export default UserProfile;