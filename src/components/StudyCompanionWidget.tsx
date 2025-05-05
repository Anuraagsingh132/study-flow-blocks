import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Flame, 
  Heart, 
  MessageCircle, 
  Minimize2, 
  Maximize2, 
  Coffee, 
  PlayCircle, 
  LevelUp
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  getStudyCompanion, 
  updateCompanion, 
  feedCompanion, 
  playWithCompanion, 
  levelUpCompanion, 
  getCompanionMood, 
  type CompanionMood 
} from "@/services/supabase/companion";
import { StudyCompanion, CompanionType } from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import * as THREE from "three";

// 3D Model components
const OwlModel = ({ mood }: { mood: CompanionMood }) => {
  const group = useRef<THREE.Group>(null);
  
  // Animate based on mood
  useFrame(({ clock }) => {
    if (group.current) {
      const t = clock.getElapsedTime();
      
      switch (mood) {
        case "happy":
          group.current.rotation.y = Math.sin(t) * 0.2;
          break;
        case "excited":
          group.current.rotation.y = Math.sin(t * 2) * 0.3;
          group.current.position.y = Math.sin(t * 3) * 0.1;
          break;
        case "tired":
          group.current.rotation.x = Math.sin(t * 0.5) * 0.1 - 0.1;
          break;
        default:
          group.current.rotation.y = Math.sin(t * 0.5) * 0.1;
      }
    }
  });

  // Create a simple geometric owl
  return (
    <group ref={group}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color={mood === "excited" ? "#a17d2e" : mood === "happy" ? "#c19741" : "#8b6914"} 
        />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[-0.4, 0.3, 0.8]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0.4, 0.3, 0.8]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="white" />
      </mesh>
      
      {/* Pupils */}
      <mesh position={[-0.4, 0.3, 1.05]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.4, 0.3, 1.05]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
      
      {/* Beak */}
      <mesh position={[0, 0, 1]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.2, 0.5, 32]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      
      {/* Wings */}
      <mesh position={[-0.8, -0.3, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.5, 1, 0.3]} />
        <meshStandardMaterial 
          color={mood === "excited" ? "#86682b" : mood === "happy" ? "#a17d2e" : "#715720"} 
        />
      </mesh>
      <mesh position={[0.8, -0.3, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.5, 1, 0.3]} />
        <meshStandardMaterial 
          color={mood === "excited" ? "#86682b" : mood === "happy" ? "#a17d2e" : "#715720"} 
        />
      </mesh>
    </group>
  );
};

interface CompanionWidgetProps {
  minimized?: boolean;
  onMaximize?: () => void;
}

const StudyCompanionWidget: React.FC<CompanionWidgetProps> = ({ 
  minimized = false,
  onMaximize
}) => {
  const { user } = useAuth();
  const [companion, setCompanion] = useState<StudyCompanion | null>(null);
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState<CompanionMood>("normal");
  const [interacting, setInteracting] = useState(false);
  const [speechBubble, setSpeechBubble] = useState("");
  
  useEffect(() => {
    if (user) {
      loadCompanion();
    } else {
      setLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    if (companion) {
      setMood(getCompanionMood(companion));
      generateSpeechBubble();
    }
  }, [companion]);
  
  const loadCompanion = async () => {
    try {
      setLoading(true);
      const data = await getStudyCompanion();
      setCompanion(data);
    } catch (error) {
      console.error("Error loading study companion:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const generateSpeechBubble = () => {
    if (!companion) return;
    
    const messages = {
      excited: [
        "I'm ready to study with you!",
        "Let's tackle those assignments!",
        "We're going to ace this!",
      ],
      happy: [
        "How's your studying going?",
        "Remember to take breaks!",
        `${companion.name} is happy to see you!`,
      ],
      normal: [
        "Need help organizing your studies?",
        "Don't forget to review your notes.",
        "Shall we study together?",
      ],
      tired: [
        "Could use a little energy...",
        "Feeling a bit tired today...",
        "Maybe we both need a break?",
      ],
    };
    
    const moodMessages = messages[mood];
    const randomMessage = moodMessages[Math.floor(Math.random() * moodMessages.length)];
    setSpeechBubble(randomMessage);
  };
  
  const handleFeed = async () => {
    if (!companion) return;
    
    setInteracting(true);
    try {
      const updated = await feedCompanion();
      if (updated) {
        setCompanion(updated);
        toast.success(`${companion.name} feels energized!`);
      }
    } catch (error) {
      console.error("Error feeding companion:", error);
      toast.error("Could not feed companion");
    } finally {
      setInteracting(false);
    }
  };
  
  const handlePlay = async () => {
    if (!companion) return;
    
    setInteracting(true);
    try {
      const updated = await playWithCompanion();
      if (updated) {
        setCompanion(updated);
        toast.success(`${companion.name} had fun playing!`);
      }
    } catch (error) {
      console.error("Error playing with companion:", error);
      toast.error("Could not play with companion");
    } finally {
      setInteracting(false);
    }
  };
  
  const handleChangeName = async () => {
    if (!companion) return;
    
    const newName = prompt("Enter a new name for your companion:", companion.name);
    if (!newName) return;
    
    setInteracting(true);
    try {
      const updated = await updateCompanion({ name: newName });
      if (updated) {
        setCompanion(updated);
        toast.success(`Your companion is now named ${newName}!`);
      }
    } catch (error) {
      console.error("Error renaming companion:", error);
      toast.error("Could not rename companion");
    } finally {
      setInteracting(false);
    }
  };
  
  const handleLevelUp = async () => {
    if (!companion) return;
    
    setInteracting(true);
    try {
      const updated = await levelUpCompanion();
      if (updated) {
        setCompanion(updated);
        toast.success(`${companion.name} leveled up to level ${updated.level}!`);
      }
    } catch (error) {
      console.error("Error leveling up companion:", error);
      toast.error("Could not level up companion");
    } finally {
      setInteracting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4" style={{ height: minimized ? "80px" : "300px" }}>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user || !companion) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-center" 
        style={{ height: minimized ? "80px" : "300px" }}>
        <p className="text-gray-500 text-center">Sign in to meet your study companion</p>
      </div>
    );
  }
  
  if (minimized) {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-lg shadow-sm p-4 cursor-pointer"
        onClick={onMaximize}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="font-medium">{companion.name}</h4>
            <p className="text-xs text-gray-500">Level {companion.level} Study Companion</p>
          </div>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden"
    >
      <div className="bg-primary/10 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-medium">{companion.name}</h3>
        </div>
        <div className="text-sm font-medium">Level {companion.level}</div>
      </div>
      
      <div className="relative h-52">
        <AnimatePresence>
          {speechBubble && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg px-4 py-2 shadow-md border border-gray-100"
            >
              <p className="text-sm">{speechBubble}</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <Canvas className="!h-full !w-full">
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />
          <OrbitControls enableZoom={false} enablePan={false} />
          <OwlModel mood={mood} />
        </Canvas>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between mb-2">
          <div>
            <div className="text-xs text-gray-500 mb-1">Happiness</div>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-500"
                style={{ width: `${companion.happiness}%` }}
                animate={{ width: `${companion.happiness}%` }}
                transition={{ type: "spring", stiffness: 80 }}
              />
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Energy</div>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-amber-500"
                style={{ width: `${companion.energy}%` }}
                animate={{ width: `${companion.energy}%` }}
                transition={{ type: "spring", stiffness: 80 }}
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleFeed}
            disabled={interacting}
          >
            <Coffee className="h-4 w-4 mr-2" />
            Feed
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePlay}
            disabled={interacting}
          >
            <Heart className="h-4 w-4 mr-2" />
            Play
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleChangeName}
            disabled={interacting}
          >
            Rename
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={handleLevelUp}
            disabled={interacting}
          >
            <Sword className="h-4 w-4 mr-2" />
            Level Up
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default StudyCompanionWidget;
