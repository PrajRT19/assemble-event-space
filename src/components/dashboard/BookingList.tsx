
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { bookingsAPI } from "@/services/api";
import { toast } from "sonner";

export function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // For admin dashboard, we'd want to show all bookings
    // This is a simplified version
    const fetchAllEventBookings = async () => {
      try {
        // In a real implementation, you'd fetch bookings for all events
        // This is just a placeholder that would be implemented with the right API
        setBookings([]);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
        toast.error("Failed to load bookings");
        setLoading(false);
      }
    };

    fetchAllEventBookings();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {bookings.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No bookings found</p>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <h3 className="font-medium">{booking.event?.title || "Unknown Event"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {booking.user?.name || "Unknown User"} - {booking.numberOfTickets} tickets
                  </p>
                </div>
                <Badge variant={booking.status === "confirmed" ? "default" : "outline"}>
                  {booking.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
