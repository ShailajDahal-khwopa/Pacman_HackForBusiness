import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface NotificationType {
  notification_id: number;
  message: string;
}

const Notification = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      const businessUuid = localStorage.getItem("businessUuid");
      const response = await fetch("http://localhost:8000/view_notifications/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_uuid: businessUuid }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setNotifications(data.notifications);
      }
      setLoading(false);
    };
    fetchNotifications();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Notifications</h1>
        {loading ? (
          <div>Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-gray-500">No notifications found.</div>
        ) : (
          <ul className="space-y-4">
            {notifications.map((n) => (
              <li key={n.notification_id} className="bg-white shadow rounded p-4">
                {n.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notification;