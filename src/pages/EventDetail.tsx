
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, DollarSign } from "lucide-react";
import { Event, Category } from "@/models/types";
import { eventsAPI, categoriesAPI, bookingsAPI } from "@/services/api";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/layout/Layout";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [ticketCount, setTicketCount] = useState("1");
  const [bookingLoading, setBookingLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!id) return;
      
      try {
        const eventData = await eventsAPI.getEventById(id);
        setEvent(eventData);
        
        // Fetch category data
        if (eventData.categoryId) {
          const categoryData = await categoriesAPI.getCategoryById(eventData.categoryId);
          setCategory(categoryData);
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load event details",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, toast]);

  const handleBookEvent = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book this event",
      });
      navigate("/login");
      return;
    }

    if (!event || !user) return;

    setBookingOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!event || !user) return;
    
    setBookingLoading(true);
    
    try {
      const tickets = parseInt(ticketCount);
      const totalAmount = event.price * tickets;
      
      await bookingsAPI.createBooking({
        eventId: event.id,
        userId: user.id,
        numberOfTickets: tickets,
        totalAmount: totalAmount,
      });
      
      toast({
        title: "Booking Confirmed!",
        description: `You have successfully booked ${tickets} ticket(s) for ${event.title}`,
      });
      
      setBookingOpen(false);
      // Redirect to dashboard after successful booking
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to complete your booking",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="mb-6">Sorry, the event you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/events")}>Browse Events</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-lg overflow-hidden mb-6">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-64 md:h-80 object-cover"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              
              {category && (
                <div className="mb-4">
                  <span className="bg-secondary text-secondary-foreground text-sm px-3 py-1 rounded-full">
                    {category.name}
                  </span>
                </div>
              )}
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span>{format(new Date(event.date), "h:mm a")}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{event.location}</span>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-2">About This Event</h2>
                <p className="whitespace-pre-line">{event.description}</p>
              </div>
            </div>

            <div>
              <div className="bg-card p-6 rounded-lg shadow-sm border">
                <div className="mb-4 text-2xl font-bold">${event.price.toFixed(2)}</div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>Capacity: {event.capacity} attendees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span>Price per ticket: ${event.price.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={handleBookEvent}
                >
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Event Tickets</DialogTitle>
            <DialogDescription>
              Complete your booking for {event.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ticket-count">Number of Tickets</Label>
              <Select value={ticketCount} onValueChange={setTicketCount}>
                <SelectTrigger id="ticket-count">
                  <SelectValue placeholder="Select number of tickets" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(10)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1} {i === 0 ? "ticket" : "tickets"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Price per Ticket</Label>
              <Input value={`$${event.price.toFixed(2)}`} disabled />
            </div>

            <div className="space-y-2">
              <Label>Total Amount</Label>
              <Input 
                value={`$${(event.price * parseInt(ticketCount)).toFixed(2)}`} 
                disabled 
                className="font-bold"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmBooking} disabled={bookingLoading}>
              {bookingLoading ? "Processing..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
