
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { eventsAPI } from "@/services/api";
import { Calendar, Edit, Trash } from "lucide-react";
import { toast } from "sonner";

export function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsData = await eventsAPI.getAllEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleDeleteEvent = async (id) => {
    try {
      await eventsAPI.deleteEvent(id);
      setEvents(events.filter(event => event.id !== id));
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error("Failed to delete event");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Events</CardTitle>
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
        <CardTitle className="flex justify-between items-center">
          <span>Events</span>
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" /> Add Event
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {events.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No events found</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
