
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarPlus, Calendar, MapPin, Search, IndianRupee, Plus } from "lucide-react";
import { Event, Category } from "@/models/types";
import { eventsAPI, categoriesAPI } from "@/services/api";
import { format } from "date-fns";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Layout } from "@/components/layout/Layout";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const navigate = useNavigate();
  const { toast } = useToast();
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, categoriesData] = await Promise.all([
          eventsAPI.getAllEvents(),
          categoriesAPI.getAllCategories()
        ]);
        setEvents(eventsData);
        setFilteredEvents(eventsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...events];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        event =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter(event => event.categoryId === categoryFilter);
    }
    
    setFilteredEvents(filtered);
  }, [searchTerm, categoryFilter, events]);

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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Browse Events</h1>
            <p className="text-muted-foreground">Discover and book upcoming events</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              onClick={() => setCreateEventOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add New Event
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              className="pl-10"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <CalendarPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button onClick={() => { setSearchTerm(""); setCategoryFilter("all"); }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => {
              const category = categories.find(c => c.id === event.categoryId);
              return (
                <Card key={event.id} className="event-card overflow-hidden">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                      {category && (
                        <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
                          {category.name}
                        </span>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
                    </CardDescription>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2">{event.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <p className="font-bold flex items-center">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      {event.price.toLocaleString('en-IN')}
                    </p>
                    <Button 
                      variant="default" 
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
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
                  <Label htmlFor="price">Price (₹)</Label>
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
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
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
