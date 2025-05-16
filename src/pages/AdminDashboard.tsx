import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, FileText, Users, CalendarCheck, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { eventsAPI, bookingsAPI } from "@/services/api";
import { Event, Booking } from "@/models/types";
import { format } from "date-fns";
import { Layout } from "@/components/layout/Layout";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BookingWithUser = Booking & {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  }
};

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [bookings, setBookings] = useState<BookingWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    imageUrl: "",
    capacity: "100",
    price: "0",
    categoryId: "1",
  });
  const [formErrors, setFormErrors] = useState<Partial<typeof eventForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsData = await eventsAPI.getAllEvents();
        setEvents(eventsData);
        
        // Select the most recent event by default
        if (eventsData.length > 0) {
          const sortedEvents = [...eventsData].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          const mostRecentEvent = sortedEvents[0];
          setSelectedEvent(mostRecentEvent);
          
          // Fetch bookings for the selected event
          const eventBookings = await bookingsAPI.getEventBookings(mostRecentEvent.id);
          setBookings(eventBookings as BookingWithUser[]);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load dashboard data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleEventSelect = async (event: Event) => {
    setSelectedEvent(event);
    setLoading(true);
    
    try {
      const eventBookings = await bookingsAPI.getEventBookings(event.id);
      setBookings(eventBookings as BookingWithUser[]);
    } catch (error) {
      console.error("Failed to fetch event bookings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load booking data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEventForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setEventForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const errors: Partial<typeof eventForm> = {};
    let valid = true;
    
    if (!eventForm.title.trim()) {
      errors.title = "Title is required";
      valid = false;
    }
    
    if (!eventForm.description.trim()) {
      errors.description = "Description is required";
      valid = false;
    }
    
    if (!eventForm.date) {
      errors.date = "Date is required";
      valid = false;
    }
    
    if (!eventForm.time) {
      errors.time = "Time is required";
      valid = false;
    }
    
    if (!eventForm.location.trim()) {
      errors.location = "Location is required";
      valid = false;
    }
    
    if (!eventForm.imageUrl.trim()) {
      errors.imageUrl = "Image URL is required";
      valid = false;
    }
    
    const capacity = parseInt(eventForm.capacity);
    if (isNaN(capacity) || capacity <= 0) {
      errors.capacity = "Capacity must be a positive number";
      valid = false;
    }
    
    const price = parseFloat(eventForm.price);
    if (isNaN(price) || price < 0) {
      errors.price = "Price must be a non-negative number";
      valid = false;
    }
    
    setFormErrors(errors);
    return valid;
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Combine date and time
      const dateTime = new Date(`${eventForm.date}T${eventForm.time}`);
      
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        date: dateTime,
        location: eventForm.location,
        imageUrl: eventForm.imageUrl,
        capacity: parseInt(eventForm.capacity),
        price: parseFloat(eventForm.price),
        categoryId: eventForm.categoryId,
        createdBy: "1", // Admin user ID
      };
      
      const newEvent = await eventsAPI.createEvent(eventData);
      
      toast({
        title: "Event Created",
        description: `${eventForm.title} has been created successfully`,
      });
      
      // Close the dialog and clear form
      setCreateEventOpen(false);
      setEventForm({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        imageUrl: "",
        capacity: "100",
        price: "0",
        categoryId: "1",
      });
      
      // Add the new event to the state
      setEvents([newEvent, ...events]);
      setSelectedEvent(newEvent);
      setBookings([]); // No bookings for the new event yet
    } catch (error) {
      console.error("Failed to create event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create the event",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats calculation
  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;
  const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;
  const totalAttendeesForSelectedEvent = bookings
    .filter(b => b.status === "confirmed")
    .reduce((sum, b) => sum + b.numberOfTickets, 0);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your events and bookings</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-2">
            <Button 
              variant="outline"
              onClick={() => navigate("/admin/notifications")}
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </Button>
            <Button 
              onClick={() => setCreateEventOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents}</div>
              <p className="text-xs text-muted-foreground">Across all categories</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">Events scheduled in the future</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Confirmed Bookings</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confirmedBookings}</div>
              <p className="text-xs text-muted-foreground">For the selected event</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAttendeesForSelectedEvent}</div>
              <p className="text-xs text-muted-foreground">For the selected event</p>
            </CardContent>
          </Card>
        </div>

        {/* Event Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Select Event</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {events.map((event) => (
              <Card 
                key={event.id}
                className={`cursor-pointer transition-colors ${
                  selectedEvent?.id === event.id 
                    ? "border-primary bg-primary/5" 
                    : "hover:border-primary/50"
                }`}
                onClick={() => handleEventSelect(event)}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-base truncate">{event.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.date), "MMM d, yyyy")}
                  </p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Bookings Table */}
        {selectedEvent && (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Bookings for {selectedEvent.title}
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Bookings Yet</h3>
                <p className="text-muted-foreground">
                  There are no bookings for this event yet.
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableCaption>A list of all bookings for {selectedEvent.title}</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tickets</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Booked On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.user.name}</TableCell>
                        <TableCell>{booking.user.email}</TableCell>
                        <TableCell>{booking.numberOfTickets}</TableCell>
                        <TableCell>${booking.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              booking.status === "confirmed" ? "default" : 
                              booking.status === "cancelled" ? "destructive" : 
                              "outline"
                            }
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(booking.createdAt), "MMM d, yyyy")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Event Dialog */}
      <Dialog open={createEventOpen} onOpenChange={setCreateEventOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Fill out the form below to create a new event.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateEvent}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={eventForm.title}
                  onChange={handleInputChange}
                  className={formErrors.title ? "border-destructive" : ""}
                />
                {formErrors.title && (
                  <p className="text-sm text-destructive">{formErrors.title}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={eventForm.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={formErrors.description ? "border-destructive" : ""}
                />
                {formErrors.description && (
                  <p className="text-sm text-destructive">{formErrors.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={eventForm.date}
                    onChange={handleInputChange}
                    className={formErrors.date ? "border-destructive" : ""}
                  />
                  {formErrors.date && (
                    <p className="text-sm text-destructive">{formErrors.date}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={eventForm.time}
                    onChange={handleInputChange}
                    className={formErrors.time ? "border-destructive" : ""}
                  />
                  {formErrors.time && (
                    <p className="text-sm text-destructive">{formErrors.time}</p>
                  )}
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={eventForm.location}
                  onChange={handleInputChange}
                  className={formErrors.location ? "border-destructive" : ""}
                />
                {formErrors.location && (
                  <p className="text-sm text-destructive">{formErrors.location}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={eventForm.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className={formErrors.imageUrl ? "border-destructive" : ""}
                />
                {formErrors.imageUrl && (
                  <p className="text-sm text-destructive">{formErrors.imageUrl}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    value={eventForm.capacity}
                    onChange={handleInputChange}
                    min="1"
                    className={formErrors.capacity ? "border-destructive" : ""}
                  />
                  {formErrors.capacity && (
                    <p className="text-sm text-destructive">{formErrors.capacity}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={eventForm.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={formErrors.price ? "border-destructive" : ""}
                  />
                  {formErrors.price && (
                    <p className="text-sm text-destructive">{formErrors.price}</p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={eventForm.categoryId} 
                    onValueChange={(value) => handleSelectChange("categoryId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Conference</SelectItem>
                      <SelectItem value="2">Workshop</SelectItem>
                      <SelectItem value="3">Social</SelectItem>
                      <SelectItem value="4">Concert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateEventOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
