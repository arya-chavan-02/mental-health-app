import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import {
  Users,
  MessageSquare,
  TrendingUp,
  Shield,
  Activity,
  AlertCircle,
  CheckCircle,
  Search,
  Mail,
  Phone,
  MoreVertical,
  UserCheck,
  UserX,
  HelpCircle,
  Clock,
  User,
  Trash2,
  Ban
} from 'lucide-react';

export const AdminProfile = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [supportRequests, setSupportRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatSessions, setChatSessions] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);


  const [stats, setStats] = useState({
    total_users: 0,
    active_sessions: 0,
    avg_response_time: "0s",
    user_satisfaction: "0%",
  });

  const statsArr = [
    {
      label: "Total Users",
      value: stats.total_users,
      icon: Users,
      color: "text-teal-500",
      trend: "+12%",
    },
    {
      label: "Active Sessions",
      value: stats.active_sessions,
      icon: MessageSquare,
      color: "text-cyan-500",
      trend: "+5%",
    },
    {
      label: "Avg Response Time",
      value: stats.avg_response_time,
      icon: Activity,
      color: "text-emerald-500",
      trend: "-8%",
    },
    {
      label: "User Satisfaction",
      value: stats.user_satisfaction,
      icon: TrendingUp,
      color: "text-green-500",
      trend: "+3%",
    },
  ];
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  // const allUsers = [
  //   { id: 1, name: 'Emma Wilson', email: 'emma.w@email.com', status: 'active', sessions: 15, joinedDate: 'Jan 15, 2024', lastActive: '2 min ago' },
  //   { id: 2, name: 'James Brown', email: 'james.b@email.com', status: 'active', sessions: 8, joinedDate: 'Feb 22, 2024', lastActive: '5 min ago' },
  //   { id: 3, name: 'Sofia Garcia', email: 'sofia.g@email.com', status: 'inactive', sessions: 23, joinedDate: 'Dec 10, 2023', lastActive: '2 hours ago' },
  //   { id: 4, name: 'Lucas Chen', email: 'lucas.c@email.com', status: 'active', sessions: 12, joinedDate: 'Jan 28, 2024', lastActive: '10 min ago' },
  //   { id: 5, name: 'Ava Johnson', email: 'ava.j@email.com', status: 'inactive', sessions: 6, joinedDate: 'Mar 5, 2024', lastActive: '1 day ago' },
  //   { id: 6, name: 'Oliver Martinez', email: 'oliver.m@email.com', status: 'active', sessions: 19, joinedDate: 'Nov 20, 2023', lastActive: '15 min ago' },
  //   { id: 7, name: 'Isabella Lee', email: 'isabella.l@email.com', status: 'active', sessions: 31, joinedDate: 'Oct 8, 2023', lastActive: '1 hour ago' },
  //   { id: 8, name: 'Noah Anderson', email: 'noah.a@email.com', status: 'suspended', sessions: 4, joinedDate: 'Mar 12, 2024', lastActive: '3 days ago' },
  // ];

  // const supportRequests = [
  //   {
  //     id: 1,
  //     user: 'Emma Wilson',
  //     subject: 'Unable to access chat history',
  //     priority: 'high',
  //     status: 'open',
  //     timestamp: '10 min ago',
  //     message: 'I can\'t see my previous conversations from last week. Can you help?'
  //   },
  //   {
  //     id: 2,
  //     user: 'Lucas Chen',
  //     subject: 'Feature request: Dark mode',
  //     priority: 'low',
  //     status: 'open',
  //     timestamp: '1 hour ago',
  //     message: 'Would love to have a dark mode option for late night sessions.'
  //   },
  //   {
  //     id: 3,
  //     user: 'Sofia Garcia',
  //     subject: 'Chatbot not responding',
  //     priority: 'high',
  //     status: 'in-progress',
  //     timestamp: '2 hours ago',
  //     message: 'The assistant stopped responding mid-conversation.'
  //   },
  //   {
  //     id: 4,
  //     user: 'Isabella Lee',
  //     subject: 'Request for human therapist',
  //     priority: 'urgent',
  //     status: 'open',
  //     timestamp: '30 min ago',
  //     message: 'I would like to speak with a professional therapist. How can I get connected?'
  //   },
  //   {
  //     id: 5,
  //     user: 'Oliver Martinez',
  //     subject: 'Thank you note',
  //     priority: 'low',
  //     status: 'resolved',
  //     timestamp: '3 hours ago',
  //     message: 'Just wanted to say thank you for this amazing platform. It has helped me a lot.'
  //   },
  // ];

  // Base URL for admin APIs
  const API_BASE_URL = "http://127.0.0.1:8000/api/v1/admin";

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [usersRes, requestsRes, statsRes, chatSessionsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/support_requests`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/chat/sessions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),

        ]);


        if (!usersRes.ok || !requestsRes.ok || !chatSessionsRes.ok) {
          throw new Error("Failed to fetch admin data");
        }

        const [usersData, requestsData, statsData, chatReqData] = await Promise.all([
          usersRes.json(),
          requestsRes.json(),
          statsRes.json(),
          chatSessionsRes.json(),
        ]);

        setAllUsers(usersData);
        setSupportRequests(requestsData);
        setStats(statsData);
        setChatSessions(
          Array.isArray(chatReqData)
            ? chatReqData
            : chatReqData.sessions || []
        );
      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const fetchMessages = async (sessionId) => {
  const token = localStorage.getItem("token");
  setSelectedSession(sessionId);

  const res = await fetch(`${API_BASE_URL}/chat/messages/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  console.log("CHAT MESSAGES RAW:", data);

  // FIX: support different API formats
  setChatMessages(Array.isArray(data)
            ? data
            : data.messages || []);
};

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Block user
  const handleBlockUser = async (userId: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/${userId}/block_user`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to block user");

      setAllUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId ? { ...u, status: "blocked" } : u
        )
      );
    } catch (err) {
      console.error("Error blocking user:", err);
      alert("Failed to block user. Please try again.");
    }
  };

  // Unblock user
  const handleUnblockUser = async (userId: number) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/${userId}/unblock_user`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to unblock user");

      setAllUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId ? { ...u, status: "active" } : u
        )
      );
    } catch (err) {
      console.error("Error unblocking user:", err);
      alert("Failed to unblock user. Please try again.");
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: number) => {
    const token = localStorage.getItem("token");

    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    )
      return;

    try {
      const res = await fetch(`${API_BASE_URL}/${userId}/delete_user`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete user");

      setAllUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleMarkResolved = async (requestId: number) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${API_BASE_URL}/support_request/${requestId}/mark_resolved`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to mark request as resolved");

      // Update UI instantly
      setSupportRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: "resolved" } : req
        )
      );
    } catch (err) {
      console.error("Error resolving ticket:", err);
      alert("Failed to mark request as resolved. Please try again.");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 border-red-200 bg-red-50';
      case 'medium': return 'text-orange-600 border-orange-200 bg-orange-50';
      case 'low': return 'text-gray-600 border-gray-200 bg-gray-50';
      default: return 'text-teal-600 border-teal-200 bg-teal-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-cyan-600 border-cyan-200';
      case 'in-progress': return 'text-amber-600 border-amber-200';
      case 'resolved': return 'text-emerald-600 border-emerald-200';
      default: return 'text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Header */}
        <Card className="border-teal-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-500">
                <AvatarFallback>
                  <Shield className="w-12 h-12 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-teal-900">{user?.name}</h2>
                  <Badge className="bg-teal-100 text-teal-700">Administrator</Badge>
                </div>
                <p className="text-sm text-teal-600 mt-1">{user?.email}</p>
                <p className="text-sm text-teal-500 mt-1">Managing MindCare Platform</p>
              </div>
              <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsArr.map((stat, index) => (
            <Card key={index} className="border-teal-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                    {stat.trend}
                  </Badge>
                </div>
                <p className="text-teal-900 mt-2">{stat.value}</p>
                <p className="text-sm text-teal-600">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="bg-white border border-teal-100">
            <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
              <HelpCircle className="w-4 h-4 mr-2" />
              Support
            </TabsTrigger>
            <TabsTrigger
              value="monitor" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Monitor Chats
            </TabsTrigger>
          </TabsList>

          {/* Manage Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="border-teal-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-teal-900">User Management</CardTitle>
                    <CardDescription className="text-teal-600">View and manage all platform users</CardDescription>
                  </div>
                  {/* <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                    <Users className="w-4 h-4 mr-2" />
                    Add User
                  </Button> */}
                </div>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-teal-400" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-teal-200 focus:border-teal-400"
                  />
                </div>

                {/* Users Table */}
                <div className="space-y-3">
                  {filteredUsers.map((userData) => (
                    <div key={userData.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-teal-100 hover:border-teal-200 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-400">
                          <AvatarFallback className="text-white">
                            {userData.name.split(' ').map((n: string[]) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-teal-900">{userData.name}</p>
                            <Badge
                              variant="outline"
                              className={
                                userData.status === 'active' ? 'text-emerald-600 border-emerald-200' :
                                  userData.status === 'blocked' ? 'text-red-600 border-red-200' :
                                    'text-gray-400 border-gray-200'
                              }
                            >
                              {userData.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-teal-600">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {userData.email} | {userData.phone}
                            </span>
                            <span>{userData.sessions} sessions</span>
                            <span>Joined {userData.joinedDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-teal-500">{userData.lastActive}</span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-teal-600 hover:bg-teal-50">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            <DropdownMenuItem
                              className={`flex items-center gap-2 ${userData.status === 'active' ? 'disabled-item' : ''}`}
                              onClick={() => handleBlockUser(userData.id)}
                              data-disabled={userData.status === 'blocked'}
                            >
                              <Ban className="w-4 h-4" />
                              Block User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className={`flex items-center gap-2 ${userData.status === 'active' ? 'disabled-item' : ''}`}
                              onClick={() => handleUnblockUser(userData.id)}
                              data-disabled={userData.status === 'active'}
                            >
                              <UserCheck className="w-4 h-4" />
                              Unblock User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="flex items-center gap-2"
                              onClick={() => handleDeleteUser(userData.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-4">
            <Card className="border-teal-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-teal-900">Support Requests</CardTitle>
                    <CardDescription className="text-teal-600">Manage user support tickets and inquiries</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-cyan-600 border-cyan-200">
                      {supportRequests.filter(req => req.status === "resolved").length} Resolved
                    </Badge>
                    <Badge variant="outline" className="text-amber-600 border-amber-200">
                      {supportRequests.filter(req => req.status === "open").length} In Progress
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportRequests.map((request) => (
                    <Card key={request.id} className="border-teal-100 hover:border-teal-200 transition-colors">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-teal-900">{request.title}</h4>
                                <Badge variant="outline" className={getPriorityColor(request.priority)}>
                                  {request.priority}
                                </Badge>
                                <Badge variant="outline" className={getStatusColor(request.status)}>
                                  {request.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-teal-600">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {allUsers.filter(user => user.id === request.user_id)[0]?.name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(request.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-teal-700 bg-teal-50 p-3 rounded-lg border border-teal-100">
                            {request.description}
                          </p>
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                            >
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Respond
                            </Button>
                            {request.status !== "resolved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                onClick={() => handleMarkResolved(request.id)}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Mark Resolved
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitor Chats Tab */}
          <TabsContent value="monitor" className="space-y-4">
            <Card className="border-teal-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-teal-900">Chat Monitoring</CardTitle>
                    <CardDescription className="text-teal-600">
                      View user chat sessions and monitor conversations in real time
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                  {/* SESSIONS LIST */}
                  <div className="border rounded-lg p-3 bg-white h-[600px] overflow-auto">
                    <h3 className="text-teal-900 mb-3 font-medium">User Sessions</h3>

                    {chatSessions.map((s) => (
                      <div
                        key={s.session_id}
                        className={`p-3 border rounded-lg mb-2 cursor-pointer hover:bg-teal-50 ${selectedSession === s.session_id ? "bg-teal-100" : ""
                          }`}
                        onClick={() => fetchMessages(s.session_id)}
                      >
                        <p className="text-teal-900 font-medium">{s.title}</p>
                        <p className="text-xs text-teal-600">
                          Last Updated: {formatDate(s.last_updated)}
                        </p>
                        <p className="text-xs text-gray-500">
                          User: {s.user_name} (ID: {s.user_id})
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* CHAT MESSAGES VIEW */}
                  <div className="lg:col-span-2 border rounded-lg p-3 bg-white h-[600px] overflow-auto">
                    <h3 className="text-teal-900 mb-3 font-medium">Chat Messages</h3>

                    {chatMessages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-lg mb-2 border ${m.role === "user"
                          ? "bg-teal-50 border-teal-200"
                          : "bg-gray-50 border-gray-200"
                          }`}
                      >
                        <p className="font-semibold">
                          {m.role.toUpperCase()} — {m.emotion ? m.emotion : "neutral"}
                        </p>
                        <p className="text-sm text-gray-700">{m.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(m.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div >
  );
};