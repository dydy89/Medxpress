import React, { useEffect, useState } from 'react';
import { FaSignOutAlt, FaBell, FaCheck, FaTimes } from 'react-icons/fa';

type Notification = {
  id: number;
  message: string;
  createdAt: string;
  read: boolean;
  status?: 'accepted' | 'refused' | null;
  orderId: number;
};

const CourierDashboard = () => {
  const [driverId, setDriverId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const storedId = localStorage.getItem('id');
    const id = parseInt(storedId ?? '', 10);
    if (!isNaN(id)) {
      setDriverId(id);
    }
  }, []);

  useEffect(() => {
    if (driverId) {
      fetch(`http://localhost:8080/api/notifications/${driverId}`)
        .then((res) => res.json())
        .then((data: Notification[]) => {
          console.log('Received notifications:', data);
          setNotifications(data);
        })
        .catch(() => {
          setMessage({ type: 'error', text: 'Error loading notifications.' });
        });
    }
  }, [driverId]);

  const handleAccept = async (orderId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/order/${orderId}/accept`, {
        method: 'POST',
      });
      const result = await response.json();

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.orderId === orderId ? { ...n, status: 'accepted' } : n
          )
        );
        setMessage({ type: 'success', text: 'Order accepted successfully.' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to accept order.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error.' });
    }
  };

  const handleRefuse = async (orderId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/order/${orderId}/refuse`, {
        method: 'POST',
      });
      const result = await response.json();

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.orderId === orderId ? { ...n, status: 'refused' } : n
          )
        );
        setMessage({ type: 'success', text: 'Order refused successfully.' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to refuse order.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error.' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    localStorage.removeItem("id"); 
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Courier Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center text-red-600 hover:text-red-800 font-medium"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <FaBell className="text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-700">Notifications</h2>
          </div>

          {notifications.length > 0 ? (
            <ul className="space-y-4">
              {notifications.map((notif) => (
                <li 
                  key={notif.id} 
                  className={`p-4 border rounded-lg shadow-sm transition-all hover:shadow-md ${
                    notif.status === 'accepted' ? 'border-green-200 bg-green-50' : 
                    notif.status === 'refused' ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <p className="text-gray-800">{notif.message}</p>
                  <small className="text-gray-500 block mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </small>

                  {!notif.status && (
                    <div className="mt-3 flex gap-3">
                      <button
                        onClick={() => handleAccept(notif.orderId)}
                        className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <FaCheck className="mr-2" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleRefuse(notif.orderId)}
                        className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <FaTimes className="mr-2" />
                        Refuse
                      </button>
                    </div>
                  )}

                  {notif.status && (
                    <div className="mt-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        notif.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {notif.status === 'accepted' ? 'Accepted' : 'Refused'}
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No notifications available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourierDashboard;