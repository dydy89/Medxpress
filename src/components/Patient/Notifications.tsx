// src/components/Patient/Notifications.tsx

import React from 'react';

interface NotificationProps {
  message: string;
}

export const Notification: React.FC<NotificationProps> = ({ message }) => {
  return (
    <div className="bg-blue-100 text-blue-700 p-4 rounded-lg shadow-sm">
      <p>{message}</p>
    </div>
  );
};
