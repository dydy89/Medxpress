import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkedAlt, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';

type Notification = {
  id: number;
  message: string;
  createdAt: string;
  order: {
    id: number;
    pharmacy: {
      address: string;
      latitude: number;
      longitude: number;
    };
  };
};

const CourierDashboard = () => {
  const { driverId } = useParams<{ driverId: string }>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Notification['order'] | null>(null);
  const [isAccepted, setIsAccepted] = useState(false);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    if (!driverId) return;

    const token = localStorage.getItem('jwt');
    if (!token) {
      console.error("Aucun token trouvé pour l'authentification.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/deliveryDriver/notifications/${driverId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data: Notification[] = await res.json();
      setNotifications(data);
      if (data.length > 0) {
        setCurrentOrder(data[0].order);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des notifications', err);
    }
  };


  const handleAccept = async (orderId: number) => {
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch(
        `http://localhost:8080/api/deliveryDriver/${orderId}/accept`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200) {
        alert('Commande acceptée');
        setIsAccepted(true);
        loadNotifications();
      } else {
        alert('Erreur lors de l’acceptation');
      }
    } catch (err) {
      console.error('Erreur lors de l’acceptation', err);
    }
  };




  const handleRefuse = async (orderId: number) => {
    try {
      const token = localStorage.getItem('jwt');

      await fetch(
        `http://localhost:8080/api/deliveryDriver/${orderId}/refuse`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      alert('Commande refusée');
      loadNotifications();
    } catch (err) {
      console.error('Erreur lors du refus', err);
    }
  };

  useEffect(() => {
    if (!driverId) {
      alert('Identifiant livreur manquant.');
      navigate('/');
    } else {
      loadNotifications();
    }
  }, [driverId]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
      {notifications.map((notif) => (
        <div key={notif.id} className="border mb-4 rounded p-4 shadow">
          <p className="font-medium">{notif.message}</p>
          <p className="text-sm text-gray-500">
            {new Date(notif.createdAt).toLocaleString()}
          </p>
          <div className="flex space-x-4 mt-2">

            <button
              onClick={() => handleAccept(notif.order.id)}
              disabled={isAccepted}
              className={`flex items-center px-4 py-2 rounded ${isAccepted
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
            >
              <FaMapMarkedAlt className="mr-2" />
              {isAccepted ? 'Acceptée' : 'Accepter'}
            </button>

            <button
              onClick={() => handleRefuse(notif.order.id)}
              className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              <FaTimesCircle className="mr-2" /> Refuser
            </button>
          </div>
        </div>
      ))}

      {currentOrder && (
        <div className="mt-8 p-4 border rounded bg-gray-50 shadow">
          <h3 className="font-semibold mb-2">Étape 1 : Aller à la pharmacie</h3>
          <p>{currentOrder.pharmacy?.address || 'Adresse pharmacie inconnue'}</p>
          <button
            onClick={() =>
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentOrder.pharmacy.address)}`,
                '_blank'
              )
            }

            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
          >
            Voir l'itinéraire
          </button>
        </div>
      )}
    </div>
  );
};

export default CourierDashboard;
