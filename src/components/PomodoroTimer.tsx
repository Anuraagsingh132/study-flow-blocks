
import React, { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Play, Pause, RefreshCw, X, 
  BookOpen, Check, Trophy, Volume2, VolumeX 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { startStudySession, completeStudySession, getUserStats } from "@/services/supabase/studySessions";
import { getSubjects } from "@/services/supabase/subjects";
import { Subject, UserStats, StudySession } from "@/types";

interface PomodoroTimerProps {
  onComplete?: () => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes in seconds
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [timerDuration, setTimerDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [sessionData, setSessionData] = useState<StudySession | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [previousLevel, setPreviousLevel] = useState(1);
  
  // Audio references
  const timerCompleteSound = useRef<HTMLAudioElement | null>(null);
  const intervalId = useRef<number | null>(null);

  useEffect(() => {
    // Create audio elements
    timerCompleteSound.current = new Audio('/timer-complete.mp3');
    
    // Load subjects if user is logged in
    if (user) {
      loadSubjects();
      loadUserStats();
    }
    
    return () => {
      // Clear any running timer on unmount
      if (intervalId.current) {
        window.clearInterval(intervalId.current);
      }
    };
  }, [user]);

  const loadSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
      if (data.length > 0) {
        setSelectedSubjectId(data[0].id);
      }
    } catch (error) {
      console.error("Error loading subjects:", error);
    }
  };

  const loadUserStats = async () => {
    try {
      const data = await getUserStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading user stats:", error);
    }
  };

  const startTimer = async () => {
    // Reset timer if it was previously completed
    if (timeRemaining === 0) {
      setTimeRemaining(timerDuration * 60);
    }
    
    setTimerActive(true);
    
    // Start a study session if in focus mode
    if (mode === "focus" && user && !sessionData) {
      try {
        const session = await startStudySession(selectedSubjectId);
        setSessionData(session);
      } catch (error) {
        console.error("Error starting study session:", error);
        toast.error("Could not start study session");
      }
    }
    
    // Start the timer
    intervalId.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Timer complete
          clearInterval(intervalId.current!);
          setTimerActive(false);
          
          // Play sound if enabled
          if (soundEnabled && timerCompleteSound.current) {
            timerCompleteSound.current.play().catch(e => console.error("Error playing sound:", e));
          }
          
          // Handle completion of a focus session
          if (mode === "focus") {
            handleCompleteFocusSession();
          }
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    if (intervalId.current) {
      window.clearInterval(intervalId.current);
      intervalId.current = null;
    }
    setTimerActive(false);
  };

  const resetTimer = () => {
    pauseTimer();
    setTimeRemaining(mode === "focus" ? timerDuration * 60 : breakDuration * 60);
  };

  const switchMode = (newMode: "focus" | "break") => {
    pauseTimer();
    setMode(newMode);
    setTimeRemaining(newMode === "focus" ? timerDuration * 60 : breakDuration * 60);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    const total = mode === "focus" ? timerDuration * 60 : breakDuration * 60;
    return ((total - timeRemaining) / total) * 100;
  };

  const handleCompleteFocusSession = async () => {
    setCompletedPomodoros(prev => prev + 1);
    
    // Save completed session to database
    if (sessionData) {
      try {
        // Calculate XP based on session duration (1 XP per minute)
        const xpEarned = timerDuration;
        
        await completeStudySession(sessionData.id, timerDuration, xpEarned);
        setSessionData(null);
        
        // Toast notification
        toast.success(`Pomodoro complete! +${xpEarned} XP earned`);
        
        // Reload stats to check for level up
        const previousStats = stats;
        const newStats = await getUserStats();
        setStats(newStats);
        
        // Check if user leveled up
        if (previousStats && newStats && newStats.level > previousStats.level) {
          setPreviousLevel(previousStats.level);
          setShowLevelUp(true);
        }
        
        // Switch to break mode
        if (completedPomodoros < 3) {
          // Short break after 1-3 pomodoros
          switchMode("break");
        } else {
          // Longer break after 4 pomodoros
          setBreakDuration(15);
          switchMode("break");
          setCompletedPomodoros(0);
        }
        
      } catch (error) {
        console.error("Error completing study session:", error);
      }
    }
    
    if (onComplete) {
      onComplete();
    }
  };

  // 3D XP Orb component for level up animation
  const XpOrb = () => {
    return (
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#3b82f6" emissive="#1d4ed8" emissiveIntensity={0.5} />
      </mesh>
    );
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Play className="h-4 w-4" />
        Pomodoro Timer
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{mode === "focus" ? "Focus Session" : "Break Time"}</span>
              <div className="flex items-center gap-1">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < completedPomodoros 
                        ? "bg-primary" 
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6">
            {/* Timer display */}
            <div className="text-center mb-6">
              <div className="text-5xl font-bold mb-2">{formatTime(timeRemaining)}</div>
              <Progress value={getProgress()} className="h-2" />
            </div>
            
            {/* Subject selection (only in focus mode and when not active) */}
            {mode === "focus" && !timerActive && !sessionData && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Select Subject</label>
                <Select
                  value={selectedSubjectId || ""}
                  onValueChange={setSelectedSubjectId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: subject.color }} 
                          />
                          <span>{subject.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="none">No Subject</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Controls */}
            <div className="flex justify-center space-x-2 mb-6">
              {!timerActive ? (
                <Button 
                  onClick={startTimer} 
                  className="w-24"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
              ) : (
                <Button 
                  onClick={pauseTimer} 
                  variant="secondary"
                  className="w-24"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
              <Button 
                onClick={resetTimer} 
                variant="outline"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setSoundEnabled(!soundEnabled)}
                variant="outline"
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Mode switcher */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                variant={mode === "focus" ? "default" : "outline"}
                onClick={() => switchMode("focus")}
                className={`transition-all ${mode === "focus" ? "bg-primary" : ""}`}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Focus
              </Button>
              <Button
                variant={mode === "break" ? "default" : "outline"}
                onClick={() => switchMode("break")}
                className={`transition-all ${mode === "break" ? "bg-primary" : ""}`}
              >
                <Check className="h-4 w-4 mr-2" />
                Break
              </Button>
            </div>
            
            {/* Stats */}
            {stats && (
              <div className="bg-gray-50 p-3 rounded-md mt-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium">Level {stats.level}</div>
                  <div className="text-sm text-gray-500">{stats.currentXp} / {100 * (stats.level * stats.level)} XP</div>
                </div>
                <Progress 
                  value={(stats.currentXp / (100 * (stats.level * stats.level))) * 100} 
                  className="h-2" 
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Level up dialog */}
      <Dialog open={showLevelUp} onOpenChange={setShowLevelUp}>
        <DialogContent className="sm:max-w-md">
          <div className="pt-8 pb-6 px-1">
            <div className="h-48 mb-6">
              <Canvas>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <XpOrb />
              </Canvas>
            </div>
            
            <div className="text-center">
              <AnimatePresence>
                <motion.h2
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl font-bold text-primary mb-2"
                >
                  Level Up!
                </motion.h2>
              </AnimatePresence>
              
              <p className="text-gray-600 mb-4">
                Congratulations! You've reached level {stats?.level}
              </p>
              
              <div className="flex justify-center mt-6">
                <Button onClick={() => setShowLevelUp(false)} className="px-8">
                  <Trophy className="h-4 w-4 mr-2" />
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PomodoroTimer;
