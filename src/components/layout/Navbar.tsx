
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { CalendarPlus, LogIn, User, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { notificationsAPI } from "@/services/api";
import { Notification } from "@/models/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export function Navbar() {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = async () => {
      if (user) {
        try {
          const userNotifications = await notificationsAPI.getUserNotifications(user.id);
          if (isMounted) {
            setNotifications(userNotifications);
          }
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        }
      }
    };

    if (isAuthenticated) {
      fetchNotifications();
      // Poll for new notifications every minute
      const intervalId = setInterval(fetchNotifications, 60000);
      return () => {
        isMounted = false;
        clearInterval(intervalId);
      };
    }
  }, [isAuthenticated, user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    if (user) {
      try {
        await notificationsAPI.markAllAsRead(user.id);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CalendarPlus className="h-6 w-6" />
          <Link to="/" className="text-xl font-bold">
            Assemble
          </Link>
        </div>

        <nav className="flex items-center space-x-4">
          <Link to="/events" className="hover:underline">
            Events
          </Link>
          
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/admin/dashboard" className="hover:underline">
                  Admin Dashboard
                </Link>
              )}
              
              {!isAdmin && (
                <Link to="/dashboard" className="hover:underline">
                  My Bookings
                </Link>
              )}
              
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground">
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel className="flex items-center justify-between">
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-xs"
                        >
                          Mark all as read
                        </Button>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-4 px-2 text-center text-muted-foreground">
                          No notifications
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((notification) => (
                          <DropdownMenuItem
                            key={notification.id}
                            onClick={() => markAsRead(notification.id)}
                            className={`cursor-pointer ${
                              !notification.isRead 
                                ? "bg-secondary font-medium" 
                                : ""
                            }`}
                          >
                            <div className="flex flex-col py-1">
                              <span>{notification.message}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                              </span>
                            </div>
                          </DropdownMenuItem>
                        ))
                      )}
                    </div>
                    {notifications.length > 10 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => navigate("/notifications")}
                          className="text-center text-primary cursor-pointer"
                        >
                          View all notifications
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                  <DropdownMenuItem className="text-muted-foreground">{user?.email}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/login")}
                className="flex items-center gap-1"
              >
                <LogIn className="h-4 w-4 mr-1" />
                Login
              </Button>
              <Button onClick={() => navigate("/register")}>Register</Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
