import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventList } from "@/components/dashboard/EventList";
import { BookingList } from "@/components/dashboard/BookingList";
import { EventAnalytics } from "@/components/dashboard/EventAnalytics";
import { dbAPI } from "@/services/api";
import { Calendar } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== "admin") {
      navigate("/dashboard");
    }

    // Fetch database status
    const fetchDbStatus = async () => {
      try {
        const status = await dbAPI.getConnectionStatus();
        setDbStatus(status);
      } catch (error) {
        console.error("Failed to fetch DB status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDbStatus();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Database Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dbStatus?.connected ? (
                <span className="text-green-500">Connected</span>
              ) : (
                <span className="text-red-500">Disconnected</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Database: {dbStatus?.dbName || "N/A"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dbStatus?.collections?.find((c: any) => c.name === "events")?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active events in the system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dbStatus?.collections?.find((c: any) => c.name === "bookings")?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Bookings across all events
            </p>
          </CardContent>
        </Card>
      </div>
      
      <EventAnalytics />
      
      <Tabs defaultValue="events" className="mt-6">
        <TabsList>
          <TabsTrigger value="events">Manage Events</TabsTrigger>
          <TabsTrigger value="bookings">Manage Bookings</TabsTrigger>
        </TabsList>
        <TabsContent value="events" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">All Events</h2>
            <Button onClick={() => navigate("/events/create")}>Create Event</Button>
          </div>
          <EventList isAdmin={true} />
        </TabsContent>
        <TabsContent value="bookings" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">All Bookings</h2>
          <BookingList isAdmin={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
