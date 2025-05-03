
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Trophy, Star, CheckCircle2, Flag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { getAchievements, getDailyChallenge, completeDailyChallenge } from "@/services/supabase/achievements";
import { Achievement, DailyChallenge } from "@/types";
import { toast } from "sonner";
import * as THREE from "three";

const Badge3D = ({ color, spin = false }) => {
  const mesh = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    if (mesh.current) {
      mesh.current.rotation.y = -0.5;
    }
  }, []);
  
  return (
    <mesh ref={mesh}>
      <cylinderGeometry args={[1, 1, 0.15, 32]} />
      <meshStandardMaterial color={color} metalness={0.8} roughness={0.3} />
      
      {/* Badge ribbon */}
      <mesh position={[0, -0.8, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.05]} />
        <meshStandardMaterial color="#c71f37" metalness={0.3} roughness={0.6} />
      </mesh>
      
      {/* Star */}
      <mesh position={[0, 0, 0.1]}>
        <torusGeometry args={[0.5, 0.1, 16, 5]} />
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.2} />
      </mesh>
    </mesh>
  );
};

interface AchievementWidgetProps {
  className?: string;
}

const AchievementWidget: React.FC<AchievementWidgetProps> = ({ className }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewBadge, setShowNewBadge] = useState(false);
  const [newBadge, setNewBadge] = useState<Achievement | null>(null);
  
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      const [achievementsData, challengeData] = await Promise.all([
        getAchievements(),
        getDailyChallenge()
      ]);
      
      setAchievements(achievementsData);
      setDailyChallenge(challengeData);
      
      // Check for newly unlocked achievements
      const newlyUnlocked = achievementsData.find(a => 
        a.unlocked && 
        a.unlockedAt && 
        new Date(a.unlockedAt).getTime() > (Date.now() - 10 * 60 * 1000) // Unlocked in the last 10 minutes
      );
      
      if (newlyUnlocked && !showNewBadge) {
        setNewBadge(newlyUnlocked);
        setTimeout(() => {
          setShowNewBadge(true);
        }, 1000);
      }
    } catch (error) {
      console.error("Error loading achievements data:", error);
      toast.error("Failed to load achievements");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCompleteChallenge = async () => {
    if (!dailyChallenge) return;
    
    try {
      await completeDailyChallenge(dailyChallenge.id);
      
      setDailyChallenge({
        ...dailyChallenge,
        completed: true,
        completedAt: new Date().toISOString()
      });
      
      toast.success(`Challenge completed! +${dailyChallenge.xp} XP`);
    } catch (error) {
      console.error("Error completing challenge:", error);
      toast.error("Failed to complete challenge");
    }
  };
  
  const handleCloseBadgePopup = () => {
    setShowNewBadge(false);
    setNewBadge(null);
  };
  
  // Calculate stats
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progress = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const renderAchievementCard = (achievement: Achievement) => (
    <motion.div
      key={achievement.id}
      whileHover={{ y: -5 }}
      className={`
        border rounded-lg overflow-hidden bg-white
        ${achievement.unlocked ? 'shadow-md' : 'opacity-60'}
      `}
    >
      <div className={`h-28 flex items-center justify-center ${achievement.unlocked ? 'bg-amber-100' : 'bg-gray-100'}`}>
        <div className="h-24 w-24">
          <Canvas>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={0.4} />
            <Badge3D color={achievement.unlocked ? "#FFD700" : "#A0A0A0"} spin={achievement.unlocked} />
          </Canvas>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium">{achievement.name}</h3>
          {achievement.unlocked && (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
        </div>
        <p className="text-sm text-gray-600">{achievement.description}</p>
        {achievement.unlocked && achievement.unlockedAt && (
          <div className="text-xs text-gray-500 mt-2">
            Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Trophy className="h-4 w-4" />
        Achievements & Challenges
      </Button>
      
      {/* Badge unlocked popup */}
      <Dialog open={showNewBadge} onOpenChange={handleCloseBadgePopup}>
        <DialogContent className="sm:max-w-md">
          <div className="py-10">
            <div className="h-48 mb-6">
              <Canvas>
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} />
                <Badge3D color="#FFD700" spin={true} />
              </Canvas>
            </div>
            
            <div className="text-center">
              <AnimatePresence>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <h2 className="text-2xl font-bold text-amber-600 mb-2">
                    Achievement Unlocked!
                  </h2>
                  {newBadge && (
                    <>
                      <h3 className="text-xl font-semibold mb-2">{newBadge.name}</h3>
                      <p className="text-gray-600 mb-6">{newBadge.description}</p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
              
              <Button onClick={handleCloseBadgePopup}>
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Main dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Achievements & Challenges</DialogTitle>
          </DialogHeader>
          
          {loading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : !user ? (
            <div className="text-center py-12">
              <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-xl font-medium text-gray-600">Sign in to view achievements</h3>
              <p className="text-gray-500">Track your progress and unlock rewards</p>
            </div>
          ) : (
            <Tabs defaultValue="achievements">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="achievements" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  Achievements
                </TabsTrigger>
                <TabsTrigger value="challenges" className="gap-2">
                  <Flag className="h-4 w-4" />
                  Daily Challenge
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="achievements" className="m-0">
                <div className="flex items-center justify-between mb-6 bg-primary/5 rounded-lg p-4">
                  <div>
                    <h3 className="font-semibold">Your Progress</h3>
                    <p className="text-sm text-gray-500">
                      Unlocked {unlockedCount} of {totalCount} achievements
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center mr-3">
                      <span className="text-xl font-bold">{progress}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map(achievement => renderAchievementCard(achievement))}
                  
                  {achievements.length === 0 && (
                    <div className="col-span-3 text-center py-12">
                      <Award className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <h3 className="text-xl font-medium text-gray-600">No achievements yet</h3>
                      <p className="text-gray-500">Complete tasks to earn achievements</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="challenges" className="m-0">
                {dailyChallenge ? (
                  <div className="bg-white rounded-lg border p-6 mb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{dailyChallenge.title}</h3>
                        <p className="text-gray-600 mt-1">{dailyChallenge.description}</p>
                      </div>
                      <Badge className="bg-primary">{dailyChallenge.xp} XP</Badge>
                    </div>
                    
                    <div className="bg-amber-50 p-4 rounded-md mb-4 flex items-center gap-3">
                      <Star className="h-5 w-5 text-amber-500 flex-shrink-0" />
                      <p className="text-sm">
                        Complete this challenge before it expires in {
                          new Date(dailyChallenge.expiresAt) > new Date() ?
                          `${Math.ceil((new Date(dailyChallenge.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60))} hours` :
                          'Less than an hour'
                        }
                      </p>
                    </div>
                    
                    {dailyChallenge.completed ? (
                      <div className="flex justify-between items-center bg-green-50 p-4 rounded-md">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                          <span className="font-medium">Challenge completed!</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {dailyChallenge.completedAt && 
                            `Completed on ${new Date(dailyChallenge.completedAt).toLocaleTimeString()}`
                          }
                        </div>
                      </div>
                    ) : (
                      <Button 
                        onClick={handleCompleteChallenge}
                        className="w-full"
                      >
                        Mark as Complete
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Flag className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-xl font-medium text-gray-600">No active challenges</h3>
                    <p className="text-gray-500">Check back tomorrow for a new challenge</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AchievementWidget;
