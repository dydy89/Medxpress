export const Tabs = ({ tabs, activeTab, onChange }: { tabs: string[]; activeTab: string; onChange: (tab: string) => void }) => (
  <div className="flex space-x-4 border-b border-gray-200">
    {tabs.map(tab => (
      <button
        key={tab}
        className={`py-2 px-4 font-medium border-b-2 ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-600 hover:text-indigo-600'}`}
        onClick={() => onChange(tab)}
      >
        {tab}
      </button>
    ))}
  </div>
);
