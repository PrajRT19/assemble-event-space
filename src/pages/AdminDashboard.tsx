
import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { EventList } from "@/components/dashboard/EventList";
import { BookingList } from "@/components/dashboard/BookingList";
import { dbAPI } from "@/services/api";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [dbStatus, setDbStatus] = React.useState(null);
  
  useEffect(() => {
    const fetchDbStatus = async () => {
      try {
        const status = await dbAPI.getConnectionStatus();
        setDbStatus(status);
      } catch (error) {
        console.error("Failed to fetch DB status:", error);
      }
    };
    
    fetchDbStatus();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || "Administrator"}</p>
        </div>
        <Button className="mt-4 md:mt-0">
          <Calendar className="mr-2 h-4 w-4" /> Create Event
        </Button>
      </div>
      
      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Database Status</CardTitle>
          </CardHeader>
          <CardContent>
            {dbStatus ? (
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="font-medium">Connection:</span>
                  <span className={dbStatus.connected ? "text-green-600" : "text-red-600"}>
                    {dbStatus.connected ? "Connected" : "Disconnected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Database:</span>
                  <span>{dbStatus.dbName}</span>
                </div>
                <div className="grid gap-1 mt-2">
                  <span className="font-medium">Collections:</span>
                  {dbStatus.collections?.map(collection => (
                    <div key={collection.name} className="flex justify-between pl-4 text-sm">
                      <span>{collection.name}</span>
                      <span>{collection.count} records</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary"></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <EventList />
        <BookingList />
      </div>
    </div>
  );
}
