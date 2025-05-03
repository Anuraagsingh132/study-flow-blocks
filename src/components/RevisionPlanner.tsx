
import React, { useState, useEffect } from "react";
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, Brain, CheckCircle2, Circle, 
  Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSubjects } from "@/services/supabase/subjects";
import {
  getRevisionPlans,
  createRevisionPlan,
  completeRevisionPlan,
  generateSpacedRevisions,
  suggestRevisionPlans
} from "@/services/supabase/revisionPlans";
import { Subject, RevisionPlan, Priority } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface RevisionCalendarProps {
  revisions: RevisionPlan[];
  subjects: Subject[];
  onSelectDate: (date: Date) => void;
  onRevisionComplete: (plan: RevisionPlan) => void;
}

const RevisionCalendar: React.FC<RevisionCalendarProps> = ({
  revisions,
  subjects,
  onSelectDate,
  onRevisionComplete
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
  
  useEffect(() => {
    generateWeekDays();
  }, [currentDate]);
  
  const generateWeekDays = () => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Week starts on Monday
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = [];
    
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    
    setCurrentWeek(days);
  };
  
  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = direction === 'next' ? 7 : -7;
    setCurrentDate(addDays(currentDate, days));
  };
  
  const getRevisionsForDate = (date: Date): RevisionPlan[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return revisions.filter(revision => 
      format(new Date(revision.reviewDate), 'yyyy-MM-dd') === dateStr
    );
  };
  
  const getSubjectById = (id: string): Subject | undefined => {
    return subjects.find(subject => subject.id === id);
  };
  
  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };
  
  const handleRevisionComplete = (event: React.MouseEvent, plan: RevisionPlan) => {
    event.stopPropagation();
    onRevisionComplete(plan);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Revision Calendar</h3>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigateWeek('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigateWeek('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div 
            key={day} 
            className="text-center text-xs font-medium text-gray-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {currentWeek.map((date) => {
          const isToday = isSameDay(date, new Date());
          const dayRevisions = getRevisionsForDate(date);
          const hasRevisions = dayRevisions.length > 0;
          
          return (
            <motion.div
              key={date.toString()}
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectDate(date)}
              className={`
                flex flex-col min-h-[80px] rounded-md border p-1 cursor-pointer
                ${isToday ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}
              `}
            >
              <div className={`text-center text-sm ${isToday ? 'font-bold' : ''}`}>
                {format(date, 'd')}
              </div>
              
              <div className="flex-grow">
                {hasRevisions ? (
                  <div className="mt-1 space-y-1">
                    {dayRevisions.slice(0, 2).map(revision => {
                      const subject = getSubjectById(revision.subjectId);
                      return (
                        <div 
                          key={revision.id}
                          className={`
                            text-xs p-1 rounded flex items-center justify-between
                            ${revision.completed ? 'bg-gray-100 text-gray-500' : 'bg-primary/5'}
                          `}
                        >
                          <div className="flex items-center overflow-hidden">
                            {subject && (
                              <span
                                className="w-2 h-2 rounded-full mr-1 flex-shrink-0"
                                style={{ backgroundColor: subject.color }}
                              />
                            )}
                            <span className="truncate">{revision.topic}</span>
                          </div>
                          <button 
                            onClick={(e) => handleRevisionComplete(e, revision)}
                            className="ml-1"
                          >
                            {revision.completed ? (
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                            ) : (
                              <Circle className="h-3 w-3 text-gray-400" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                    {dayRevisions.length > 2 && (
                      <div className="text-xs text-gray-500 text-center mt-1">
                        +{dayRevisions.length - 2} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-xs text-gray-400">No revisions</div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

interface RevisionListProps {
  selectedDate: Date;
  revisions: RevisionPlan[];
  subjects: Subject[];
  onRevisionComplete: (plan: RevisionPlan) => void;
}

const RevisionList: React.FC<RevisionListProps> = ({
  selectedDate,
  revisions,
  subjects,
  onRevisionComplete
}) => {
  const revisionsForDate = revisions.filter(revision => 
    format(new Date(revision.reviewDate), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );
  
  const getSubjectById = (id: string): Subject | undefined => {
    return subjects.find(subject => subject.id === id);
  };
  
  const getPriorityLabel = (priority: Priority): string => {
    switch (priority) {
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return 'Medium';
    }
  };
  
  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-amber-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="font-semibold mb-4">
        Revisions for {format(selectedDate, 'EEEE, MMMM d')}
      </h3>
      
      {revisionsForDate.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CalendarIcon className="mx-auto h-10 w-10 text-gray-300 mb-2" />
          <p>No revisions scheduled for this day</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {revisionsForDate.map(revision => {
              const subject = getSubjectById(revision.subjectId);
              return (
                <motion.div
                  key={revision.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`
                    p-3 rounded-md border 
                    ${revision.completed 
                      ? 'border-gray-200 bg-gray-50' 
                      : 'border-primary/10 bg-primary/5'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      {subject && (
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: subject.color }}
                        />
                      )}
                      <h4 className={`font-medium ${revision.completed ? 'text-gray-500 line-through' : ''}`}>
                        {revision.topic}
                      </h4>
                    </div>
                    <Badge className={getPriorityColor(revision.priority)} variant="secondary">
                      {getPriorityLabel(revision.priority)}
                    </Badge>
                  </div>
                  
                  {subject && (
                    <div className="text-sm text-gray-500 mb-3">
                      {subject.name}
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button
                      variant={revision.completed ? "outline" : "default"}
                      size="sm"
                      onClick={() => onRevisionComplete(revision)}
                      disabled={revision.completed}
                    >
                      {revision.completed ? (
                        <span className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                          Completed
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Mark as Complete
                        </span>
                      )}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

interface RevisionFormProps {
  subjects: Subject[];
  selectedDate: Date;
  onSubmit: (subjectId: string, topic: string, priority: Priority) => Promise<void>;
}

const RevisionForm: React.FC<RevisionFormProps> = ({ 
  subjects,
  selectedDate,
  onSubmit
}) => {
  const [topic, setTopic] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (subjects.length > 0) {
      setSubjectId(subjects[0].id);
    }
  }, [subjects]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic || !subjectId) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(subjectId, topic, priority);
      setTopic("");
      setPriority("medium");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="subject">
          Subject
        </label>
        <Select 
          value={subjectId}
          onValueChange={setSubjectId}
        >
          <SelectTrigger id="subject">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map(subject => (
              <SelectItem key={subject.id} value={subject.id}>
                <div className="flex items-center">
                  <div 
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: subject.color }}
                  />
                  {subject.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="topic">
          Topic to Revise
        </label>
        <input
          id="topic"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Photosynthesis"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="priority">
          Priority
        </label>
        <Select 
          value={priority}
          onValueChange={(value) => setPriority(value as Priority)}
        >
          <SelectTrigger id="priority">
            <SelectValue placeholder="Select a priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="pt-2">
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          Schedule Revision for {format(selectedDate, 'MMM d')}
        </Button>
      </div>
    </form>
  );
};

interface RevisionPlannerProps {
  onComplete?: () => void;
}

const RevisionPlanner: React.FC<RevisionPlannerProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [revisions, setRevisions] = useState<RevisionPlan[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"calendar" | "form">("calendar");
  const [showSpacedDialog, setShowSpacedDialog] = useState(false);
  const [spacedSubjectId, setSpacedSubjectId] = useState("");
  const [spacedTopic, setSpacedTopic] = useState("");
  
  useEffect(() => {
    if (user && isOpen) {
      loadData();
    }
  }, [user, isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const subjectsData = await getSubjects();
      setSubjects(subjectsData);
      
      if (subjectsData.length > 0) {
        setSpacedSubjectId(subjectsData[0].id);
      }
      
      const revisionsData = await getRevisionPlans();
      setRevisions(revisionsData);
    } catch (error) {
      console.error("Error loading revision planner data:", error);
      toast.error("Failed to load revision data");
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddRevision = async (subjectId: string, topic: string, priority: Priority) => {
    try {
      const plan = await createRevisionPlan(
        subjectId,
        topic,
        format(selectedDate, 'yyyy-MM-dd'),
        priority
      );
      
      setRevisions([...revisions, plan]);
      setActiveView("calendar");
      toast.success("Revision scheduled successfully");
    } catch (error) {
      console.error("Error adding revision:", error);
      toast.error("Failed to schedule revision");
    }
  };
  
  const handleRevisionComplete = async (plan: RevisionPlan) => {
    try {
      await completeRevisionPlan(plan.id);
      
      // Update local state
      setRevisions(revisions.map(r => 
        r.id === plan.id ? { ...r, completed: true } : r
      ));
      
      toast.success("Revision marked as complete");
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error completing revision:", error);
      toast.error("Failed to update revision");
    }
  };
  
  const handleCreateSpacedRevisions = async () => {
    try {
      if (!spacedSubjectId || !spacedTopic) {
        toast.error("Please fill in all fields");
        return;
      }
      
      const plans = await generateSpacedRevisions(spacedSubjectId, spacedTopic);
      
      setRevisions([...revisions, ...plans]);
      setShowSpacedDialog(false);
      toast.success("Spaced revisions scheduled successfully");
    } catch (error) {
      console.error("Error creating spaced revisions:", error);
      toast.error("Failed to create spaced revisions");
    }
  };
  
  const handleSuggestRevisions = async () => {
    try {
      const suggestions = await suggestRevisionPlans();
      
      if (suggestions.length > 0) {
        setRevisions([...revisions, ...suggestions]);
        toast.success(`${suggestions.length} revision suggestions added`);
      } else {
        toast.info("No new revision suggestions available");
      }
    } catch (error) {
      console.error("Error suggesting revisions:", error);
      toast.error("Failed to generate revision suggestions");
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Calendar className="h-4 w-4" />
        Revision Planner
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Revision Planner</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSuggestRevisions}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Suggest Revisions
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSpacedDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Spaced Revisions
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {loading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-1">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Your Revision Schedule</h3>
                  <Button 
                    size="sm"
                    onClick={() => setActiveView(activeView === "calendar" ? "form" : "calendar")}
                  >
                    {activeView === "calendar" ? (
                      <span className="flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Revision
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        View Calendar
                      </span>
                    )}
                  </Button>
                </div>
                
                {activeView === "calendar" ? (
                  <RevisionCalendar 
                    revisions={revisions}
                    subjects={subjects}
                    onSelectDate={setSelectedDate}
                    onRevisionComplete={handleRevisionComplete}
                  />
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="font-semibold mb-4">
                      Schedule Revision for {format(selectedDate, 'EEEE, MMMM d')}
                    </h3>
                    <RevisionForm
                      subjects={subjects}
                      selectedDate={selectedDate}
                      onSubmit={handleAddRevision}
                    />
                  </div>
                )}
              </div>
              
              <RevisionList
                selectedDate={selectedDate}
                revisions={revisions}
                subjects={subjects}
                onRevisionComplete={handleRevisionComplete}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Spaced Revisions Dialog */}
      <Dialog open={showSpacedDialog} onOpenChange={setShowSpacedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Spaced Revisions</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              Create a series of revisions spaced out over time for optimal learning (based on the forgetting curve).
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="spacedSubject">
                  Subject
                </label>
                <Select 
                  value={spacedSubjectId}
                  onValueChange={setSpacedSubjectId}
                >
                  <SelectTrigger id="spacedSubject">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id}>
                        <div className="flex items-center">
                          <div 
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: subject.color }}
                          />
                          {subject.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="spacedTopic">
                  Topic to Revise
                </label>
                <input
                  id="spacedTopic"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  value={spacedTopic}
                  onChange={(e) => setSpacedTopic(e.target.value)}
                  placeholder="e.g., Quantum Physics"
                />
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-md p-3">
              <h4 className="font-medium text-sm mb-2">Revision Schedule</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="default">Day 1</Badge>
                  <span>First review</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="default">Day 3</Badge>
                  <span>Second review</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="default">Day 7</Badge>
                  <span>Third review</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="default">Day 14</Badge>
                  <span>Fourth review</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="default">Day 30</Badge>
                  <span>Fifth review</span>
                </li>
              </ul>
            </div>
            
            <div className="pt-2">
              <Button 
                className="w-full"
                onClick={handleCreateSpacedRevisions}
              >
                Create Spaced Revision Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RevisionPlanner;
