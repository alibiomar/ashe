import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAuth, updatePassword, updateProfile } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaKey,
  FaBox,
  FaTimes,
} from "react-icons/fa";
import { toast } from "sonner";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

const UserProfile = () => {
  const [orders, setOrders] = useState([]);
  const [isUnsubscribeModalOpen, setIsUnsubscribeModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const auth = getAuth();
  const db = getFirestore();
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 mx-auto p-6 max-w-3xl space-y-6"
      >
        {/* Profile Card with Avatar */}
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200 flex flex-col items-center">
          <div className="relative cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
            {auth.currentUser?.photoURL ? (
              <img
                src={auth.currentUser.photoURL}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <FaUserCircle className="text-gray-500" size={60} />
            )}
            <div className="absolute bottom-0 right-0 bg-gray-800 text-white rounded-full p-1">
              <FaUserCircle size={12} />
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-2xl font-semibold text-gray-800">
              {auth.currentUser?.displayName}
            </p>
            <p className="text-sm text-gray-500">{auth.currentUser?.email}</p>
            <p className="text-xs text-gray-400 mt-1">Click the avatar to change</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition-colors"
          >
            <FaKey className="mr-3 text-gray-600" size={20} />
            <span className="text-gray-800 font-medium">Change your password</span>
          </button>

          <button
            onClick={() => setIsUnsubscribeModalOpen(true)}
            className="w-full flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition-colors"
          >
            <FaBox className="mr-3 text-gray-600" size={20} />
            <span className="text-gray-800 font-medium">Unsubscribe from Newsletter</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition-colors"
          >
            <FaSignOutAlt className="mr-3 text-gray-600" size={20} />
            <span className="text-gray-800 font-medium">Logout</span>
          </button>
        </div>

        {/* Order History */}
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center mb-4">
            <FaBox className="mr-2 text-gray-600" />
            Order History
          </h3>
          <div className="overflow-y-auto max-h-60">
            {orders.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-2">Order ID</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2 text-sm">{order.id}</td>
                      <td className="py-2 text-sm text-gray-600">{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 text-sm">No orders found.</p>
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
          <UnsubscribeModal
            user={auth.currentUser}
            setIsModalOpen={setIsUnsubscribeModalOpen}
          />
        )}
        {isAvatarModalOpen && (
          <AvatarChangeModal setIsAvatarModalOpen={setIsAvatarModalOpen} />
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="relative bg-white p-6 rounded-xl shadow-xl w-96">
        <button
          onClick={() => setIsPasswordModalOpen(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={16} />
        </button>
        <h3 className="text-xl font-semibold mb-4">Change Password</h3>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          className="w-full p-3 mb-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setIsPasswordModalOpen(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            Change Password
          </button>
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
      console.error("Error unsubscribing:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    >
      <div className="relative bg-gray-900 text-white p-6 rounded-lg shadow-lg w-80">
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
        >
          <FaTimes size={16} />
        </button>
        <h3 className="text-lg font-semibold">Are you sure?</h3>
        <p className="text-gray-400 text-sm mt-2">
          You will no longer receive our newsletters.
        </p>
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={() => setIsModalOpen(false)}
            className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUnsubscribe}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition-colors"
          >
            Unsubscribe
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const AvatarChangeModal = ({ setIsAvatarModalOpen }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const auth = getAuth();
  const storage = getStorage();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return toast.warning("Please select an image.");
    }
    const user = auth.currentUser;
    if (!user) return;
    const storageRef = ref(storage, `avatars/${user.uid}/${selectedFile.name}`);
    try {
      const snapshot = await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      await updateProfile(user, { photoURL: downloadURL });
      toast.success("Avatar updated successfully!");
      setIsAvatarModalOpen(false);
    } catch (error) {
      toast.error("Error uploading avatar: " + error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="relative bg-white p-6 rounded-xl shadow-xl w-96">
        <button
          onClick={() => setIsAvatarModalOpen(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={16} />
        </button>
        <h3 className="text-xl font-semibold mb-4">Change Avatar</h3>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full mb-4"
        />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
          />
        )}
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setIsAvatarModalOpen(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            Upload Avatar
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;
