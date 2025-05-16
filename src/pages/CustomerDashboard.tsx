
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, CheckCircle, XCircle, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Event } from "@/models/types";
import { bookingsAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";

type BookingWithEvent = {
  id: string;
  eventId: string;
  userId: string;
  numberOfTickets: number;
  totalAmount: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
  event?: Event;
};

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<BookingWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      
      try {
        const userBookings = await bookingsAPI.getUserBookings(user.id);
        setBookings(userBookings);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const upcomingBookings = bookings.filter(
    (booking) => 
      booking.status === "confirmed" && 
      booking.event && 
      new Date(booking.event.date) >= new Date()
  );
  
  const pastBookings = bookings.filter(
    (booking) => 
      booking.event && 
      new Date(booking.event.date) < new Date()
  );
  
  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "cancelled"
  );

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await bookingsAPI.cancelBooking(bookingId);
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: "cancelled" } 
          : booking
      ));
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    }
  };

  const renderBookingList = (bookingList: BookingWithEvent[]) => {
    if (bookingList.length === 0) {
      return (
        <div className="text-center py-8">
          <Info className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <h3 className="text-lg font-medium">No bookings found</h3>
          <p className="text-muted-foreground mb-4">You don't have any bookings in this category.</p>
          <Button onClick={() => navigate("/events")}>Browse Events</Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bookingList.map((booking) => (
          <Card key={booking.id}>
            {booking.event && (
              <>
                <div className="h-40 overflow-hidden">
                  <img
                    src={booking.event.imageUrl}
                    alt={booking.event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{booking.event.title}</CardTitle>
                    <Badge
                      variant={
                        booking.status === "confirmed" ? "default" : 
                        booking.status === "cancelled" ? "destructive" : 
                        "outline"
                      }
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(booking.event.date), "EEEE, MMMM d, yyyy")}
                  </CardDescription>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {booking.event.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Tickets:</span>
                      <span className="font-medium">{booking.numberOfTickets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span className="font-medium">${booking.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Booked On:</span>
                      <span>{format(new Date(booking.createdAt), "MMM d, yyyy")}</span>
                    </div>
                    
                    {booking.status === "confirmed" && new Date(booking.event.date) > new Date() && (
                      <div className="pt-4">
                        <Button 
                          variant="outline" 
                          className="w-full border-destructive text-destructive hover:bg-destructive/10"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel Booking
                        </Button>
                      </div>
                    )}
                    
                    {booking.status === "confirmed" && (
                      <div className="pt-4">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(`/events/${booking.event?.id}`)}
                        >
                          View Event Details
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-muted-foreground">Manage your event bookings</p>
          </div>
          <Button 
            className="mt-4 md:mt-0" 
            onClick={() => navigate("/events")}
          >
            Browse More Events
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <Tabs defaultValue="upcoming">
            <TabsList className="mb-6 grid w-full grid-cols-3">
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Upcoming</span>
                <span className="bg-primary/10 px-1.5 py-0.5 rounded-full text-xs">
                  {upcomingBookings.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Past</span>
                <span className="bg-primary/10 px-1.5 py-0.5 rounded-full text-xs">
                  {pastBookings.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                <span>Cancelled</span>
                <span className="bg-primary/10 px-1.5 py-0.5 rounded-full text-xs">
                  {cancelledBookings.length}
                </span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              {renderBookingList(upcomingBookings)}
            </TabsContent>
            
            <TabsContent value="past">
              {renderBookingList(pastBookings)}
            </TabsContent>
            
            <TabsContent value="cancelled">
              {renderBookingList(cancelledBookings)}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
}
