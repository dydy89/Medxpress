export const StatCard = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
  <div className="bg-white rounded-xl shadow p-5 flex items-center space-x-4">
    <div className="text-indigo-600">{icon}</div>
    <div>
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  </div>
);
