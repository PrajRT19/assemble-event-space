
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarPlus, Users, Calendar, MapPin, IndianRupee } from "lucide-react";
import { Event } from "@/models/types";
import { eventsAPI } from "@/services/api";
import { format } from "date-fns";

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await eventsAPI.getAllEvents();
        // For now just get the first 3 events as featured
        setFeaturedEvents(events.slice(0, 3));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary py-20 md:py-28 text-primary-foreground">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')] bg-cover opacity-20 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white">
              Discover & Create Amazing Events
            </h1>
            <p className="text-xl mb-8">
              Find the perfect events to attend or create your own events to share with others.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <Button 
                size="lg" 
                variant="default" 
                onClick={() => navigate("/events")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Browse Events
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/login")}
                className="bg-white/10 hover:bg-white/20 border-white"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Featured Events</h2>
            <p className="text-muted-foreground mt-2">Discover our most popular upcoming events</p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <Card key={event.id} className="event-card overflow-hidden">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{event.title}</CardTitle>
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
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate("/events")}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              View All Events
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why Choose Assemble</h2>
            <p className="text-muted-foreground mt-2">Everything you need to create and discover events</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-accent/20 rounded-full">
                    <CalendarPlus className="h-7 w-7 text-accent" />
                  </div>
                </div>
                <CardTitle>Easy Event Creation</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Create and manage events with just a few clicks. Our intuitive interface makes event planning a breeze.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-accent/20 rounded-full">
                    <Users className="h-7 w-7 text-accent" />
                  </div>
                </div>
                <CardTitle>Seamless Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Easily book tickets to events you want to attend. Receive confirmations and reminders automatically.</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-accent/20 rounded-full">
                    <Calendar className="h-7 w-7 text-accent" />
                  </div>
                </div>
                <CardTitle>Powerful Admin Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Comprehensive tools for event administrators to manage registrations, track attendance, and engage attendees.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-accent text-accent-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-xl mx-auto">
            Join Assemble today and discover a new way to connect through events.
          </p>
          <Button 
            size="lg" 
            variant="default"
            onClick={() => navigate("/register")}
            className="bg-white text-accent hover:bg-white/90"
          >
            Sign Up Now
          </Button>
        </div>
      </section>
    </div>
  );
}
