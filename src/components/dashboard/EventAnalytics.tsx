
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventsAPI, bookingsAPI } from "@/services/api";
import { Event, Booking } from "@/models/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Calendar } from "lucide-react";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
  isWithinInterval,
  parseISO
} from "date-fns";

interface EventData {
  date: string;
  events: number;
  bookings: number;
}

export function EventAnalytics() {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month");
  const [analyticsData, setAnalyticsData] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all events and bookings
        const eventsData = await eventsAPI.getAllEvents();
        
        // We need to collect all bookings for analytics
        let allBookings: Booking[] = [];
        for (const event of eventsData) {
          const eventBookings = await bookingsAPI.getEventBookings(event.id);
          allBookings = [...allBookings, ...eventBookings];
        }
        
        setEvents(eventsData);
        setBookings(allBookings);
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      generateAnalyticsData();
    }
  }, [events, bookings, timeframe]);

  const generateAnalyticsData = () => {
    const now = new Date();
    let start: Date;
    let end: Date;
    let intervalArr: Date[];
    let formatStr: string;

    // Set time bounds based on selected timeframe
    if (timeframe === "week") {
      start = startOfWeek(now);
      end = endOfWeek(now);
      intervalArr = eachDayOfInterval({ start, end });
      formatStr = "EEE";
    } else if (timeframe === "month") {
      start = startOfMonth(now);
      end = endOfMonth(now);
      intervalArr = eachDayOfInterval({ start, end });
      formatStr = "d";
    } else {
      // year
      start = startOfYear(now);
      end = endOfYear(now);
      intervalArr = eachMonthOfInterval({ start, end });
      formatStr = "MMM";
    }

    // Generate data for charts
    const data = intervalArr.map(date => {
      const interval = {
        start: date,
        end: timeframe === "year" ? endOfMonth(date) : date
      };
      
      // Count events in this interval
      const eventsInInterval = events.filter(event => {
        const eventDate = new Date(event.date);
        return isWithinInterval(eventDate, interval);
      }).length;
      
      // Count bookings in this interval
      const bookingsInInterval = bookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return isWithinInterval(bookingDate, interval);
      }).length;

      return {
        date: format(date, formatStr),
        events: eventsInInterval,
        bookings: bookingsInInterval
      };
    });

    setAnalyticsData(data);
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Event Analytics
        </CardTitle>
        <Select
          value={timeframe}
          onValueChange={(value) => setTimeframe(value as "week" | "month" | "year")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-2 px-2">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={analyticsData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="events" fill="#8884d8" name="Events" />
              <Bar dataKey="bookings" fill="#82ca9d" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
