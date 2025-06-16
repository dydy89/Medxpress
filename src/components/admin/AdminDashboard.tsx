import React, { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  firstName: string;
  email: string;
  role: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const adminProfile = {
    name: "Admin MedExpress",
    avatar: "/images/avatar-admin.jpg",
    email: "admin@medexpress.fr"
  };

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur de chargement :", err);
        setLoading(false);
      });
  }, []);

  const deleteUser = async (userId: number) => {
    const confirmed = window.confirm("Confirmer la suppression de cet utilisateur ?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setUsers(users.filter(user => user.id !== userId));
      } else {
        alert("La suppression a échoué.");
      }
    } catch (error) {
      alert("Une erreur s'est produite.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Profil admin */}
        <div className="flex items-center bg-white rounded-xl shadow-md p-6 mb-8">
          <img 
            src={adminProfile.avatar}
            alt="Profil admin"
            className="w-20 h-20 rounded-full border-4 border-blue-300 shadow-md mr-6"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{adminProfile.name}</h1>
            <p className="text-gray-500">{adminProfile.email}</p>
          </div>
        </div>

        {/* Titre */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Gestion des utilisateurs</h2>
        </div>

        {/* Liste des utilisateurs */}
        {loading ? (
          <p className="text-gray-500">Chargement des utilisateurs...</p>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-xl shadow p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg">
                    {user.firstName[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {user.firstName} {user.name}
                    </h3>
                    <p className="text-sm text-gray-500">{user.email} — {user.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Supprimer
                </button>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-gray-500 italic">Aucun utilisateur trouvé.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
