import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { User, Clock, Calendar, MessageSquare, Award, Heart, Check, MoreVertical, Smile, Meh, Frown, Laugh, Edit, MessageCircleQuestion, HelpCircle } from 'lucide-react';

export const UserProfile = () => {

  const { user, refreshUser } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isQueryDialogOpen, setIsQueryDialogOpen] = useState(false);
  const [supportRequests, setSupportRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
    phone: '',
  });
  const [queryData, setQueryData] = useState({
    title: '',
    description: '',
    priority: '',
  });
  const stats = [
    { label: 'Total Sessions', value: user?.sessionsCount || 0, icon: MessageSquare, color: 'text-teal-500' },
    { label: 'Days Active', value: user?.daysActive || 0, icon: Calendar, color: 'text-cyan-500' },
    { label: 'Achievements', value: 8, icon: Award, color: 'text-emerald-500' },
  ];
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [requestsRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/v1/user/support_requests", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }),
      ]);

      if (!requestsRes.ok) {
        throw new Error("Failed to fetch admin data");
      }

      const [requestsData] = await Promise.all([
        requestsRes.json(),
      ]);

      setSupportRequests(requestsData.support_requests || []);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUserData();
  }, []);

  const getMoodIcon = (mood: string) => {
    switch (mood.toLowerCase()) {
      case 'great':
        return <Laugh className="w-6 h-6 text-white" />;
      case 'good':
        return <Smile className="w-6 h-6 text-white" />;
      case 'okay':
        return <Meh className="w-6 h-6 text-white" />;
      case 'bad':
        return <Frown className="w-6 h-6 text-white" />;
      default:
        return <Smile className="w-6 h-6 text-white" />;
    }
  };
  const moodData = [
    { day: 'Mon', mood: 'Good', score: 80 },
    { day: 'Tue', mood: 'Great', score: 90 },
    { day: 'Wed', mood: 'Okay', score: 65 },
    { day: 'Thu', mood: 'Good', score: 75 },
    { day: 'Fri', mood: 'Great', score: 85 },
  ];
  const goals = [
    { title: 'Daily Meditation', progress: 70, target: '10 minutes/day' },
    { title: 'Journal Entries', progress: 50, target: '5 entries/week' },
    { title: 'Sleep Quality', progress: 85, target: '7-8 hours/night' },
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleEditSave = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:8000/api/v1/user/edit_profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Update failed");
      }

      const data = await res.json();
      console.log("Updated:", data);

      setIsEditDialogOpen(false);
      await refreshUser();

    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
  const handleEditCancel = () => {
    // Reset form data to original values
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      bio: '',
      phone: '',
    });
    setIsEditDialogOpen(false);
  };
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setQueryData({
      ...queryData,
      [e.target.name]: e.target.value,
    });
  };
  const handleQuerySave = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://127.0.0.1:8000/api/v1/user/raise_query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: queryData.title,
          description: queryData.description,
          priority: queryData.priority
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Update failed");
      }

      const data = await res.json();
      console.log("Updated:", data);

      setIsQueryDialogOpen(false);
      fetchUserData();
      await refreshUser();

    } catch (error) {
      console.error("Error updating query:", error);
    }
  };
  const handleQueryCancel = () => {
    // Reset form data to original values
    setQueryData({
      title: '',
      description: '',
      priority: ''
    });
    setIsQueryDialogOpen(false);
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="border-teal-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-500">
                <AvatarFallback>
                  <User className="w-12 h-12 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-teal-900 mb-1">{user?.name}</h2>
                <p className="text-sm text-teal-600">{user?.email} | {user?.phone}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-teal-500">
                  <Calendar className="w-4 h-4" />
                  <span>Joined on {formatDate(user?.joinedDate)}</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-teal-200 text-teal-700 hover:bg-teal-50"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
              <Button
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                onClick={() => setIsQueryDialogOpen(true)}
              >
                <MessageCircleQuestion className="w-4 h-4" />
                Raise Query
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="border-teal-100">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-teal-600">{stat.label}</p>
                    <p className="text-teal-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Goals Progress */}
        <Card className="border-teal-100">
          <CardHeader>
            <CardTitle className="text-teal-900">Wellness Goals</CardTitle>
            <CardDescription className="text-teal-600">Track your progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {goals.map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-teal-900">{goal.title}</span>
                  <span className="text-sm text-teal-600">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-2" />
                <p className="text-xs text-teal-500">{goal.target}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Mood */}
        <Card className="border-teal-100">
          <CardHeader>
            <CardTitle className="text-teal-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-emerald-500" />
              Weekly Mood Tracker
            </CardTitle>
            <CardDescription className="text-teal-600">Your emotional journey this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3">
              {moodData.map((data, index) => (
                <div key={index} className="text-center">
                  <div
                    className="w-full h-24 bg-gradient-to-t from-teal-500 to-cyan-400 rounded-lg mb-2 flex flex-col items-center justify-center gap-1"
                    style={{ opacity: data.score / 100 }}
                  >
                    {getMoodIcon(data.mood)}
                    <span className="text-xs text-white">{data.score}%</span>
                  </div>
                  <p className="text-xs text-teal-600">{data.day}</p>
                  <p className="text-xs text-teal-500">{data.mood}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="support" className="w-full">
          <TabsList className="bg-white border border-teal-100">
            <TabsTrigger value="support" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white">
              <HelpCircle className="w-4 h-4 mr-2" />
              Support
            </TabsTrigger>
          </TabsList>

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
                                  <Clock className="w-3 h-3" />
                                  {formatDate(request.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-teal-700 bg-teal-50 p-3 rounded-lg border border-teal-100">
                            {request.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white border-teal-200">
          <DialogHeader>
            <DialogTitle className="text-teal-900">Edit Profile</DialogTitle>
            <DialogDescription className="text-teal-600">
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-teal-900">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-teal-900">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                placeholder="Enter your email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-teal-900">
                Phone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                placeholder="Enter your phone number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleEditCancel}
              className="border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleEditSave}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={isQueryDialogOpen} onOpenChange={setIsQueryDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white border-teal-200">
          <DialogHeader>
            <DialogTitle className="text-teal-900">Raise Query</DialogTitle>
            <DialogDescription className="text-teal-600">
              Submit your queries or issues here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-teal-900">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={queryData.title}
                onChange={handleQueryChange}
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                placeholder="Enter query title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-teal-900">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={queryData.description}
                onChange={handleQueryChange}
                className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                placeholder="Enter query description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-teal-900">
                Priority
              </Label>
              <div className="w-48">
                <Select
                  value={queryData.priority}
                  onValueChange={(val) =>
                    setQueryData({ ...queryData, priority: val })}
                  defaultValue="medium">
                  <SelectTrigger className="w-full border border-teal-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-teal-300 rounded-lg shadow-lg" style={{ width: "450px" }}>
                    <SelectItem value="high" style={{ paddingLeft: "10px", height: "30px" }}>
                      High
                    </SelectItem>
                    <SelectItem value="medium" style={{ paddingLeft: "10px", height: "30px" }}>
                      Medium
                    </SelectItem>
                    <SelectItem value="low" style={{ paddingLeft: "10px", height: "30px" }}>
                      Low
                    </SelectItem>
                  </SelectContent>
                </Select>


              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleQueryCancel}
              className="border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleQuerySave}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
