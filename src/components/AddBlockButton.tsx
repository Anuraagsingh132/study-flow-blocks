
import React, { useState } from "react";
import { Plus, BookOpen, Flag, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudyBlock, Note, Goal, Priority } from "@/types";

interface AddBlockButtonProps {
  onAddBlock: (blockType: string, data: any) => void;
}

const AddBlockButton: React.FC<AddBlockButtonProps> = ({ onAddBlock }) => {
  const [open, setOpen] = useState(false);
  const [blockType, setBlockType] = useState("study");
  const [formData, setFormData] = useState({
    subject: "",
    topic: "",
    startTime: "",
    endTime: "",
    priority: "medium" as Priority,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (blockType === "study") {
      const newBlock: Partial<StudyBlock> = {
        ...formData,
        completed: false,
      };
      onAddBlock("study", newBlock);
    } else if (blockType === "note") {
      const newNote: Partial<Note> = {
        title: formData.subject,
        content: "",
        tags: [],
      };
      onAddBlock("note", newNote);
    } else if (blockType === "goal") {
      const newGoal: Partial<Goal> = {
        title: formData.subject,
        description: formData.topic,
        deadline: formData.endTime,
        completed: false,
        progress: 0,
        steps: [],
      };
      onAddBlock("goal", newGoal);
    }
    
    setFormData({
      subject: "",
      topic: "",
      startTime: "",
      endTime: "",
      priority: "medium" as Priority,
    });
    
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="fixed right-6 bottom-6 rounded-full h-14 w-14 shadow-lg">
          <Plus size={24} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Block</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={blockType === "study" ? "default" : "outline"}
              onClick={() => setBlockType("study")}
              className="flex flex-col items-center p-3 h-auto"
            >
              <BookOpen className="h-5 w-5 mb-1" />
              <span className="text-xs">Study</span>
            </Button>
            <Button
              variant={blockType === "note" ? "default" : "outline"}
              onClick={() => setBlockType("note")}
              className="flex flex-col items-center p-3 h-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 mb-1"
              >
                <path d="M12 3v12" />
                <path d="M5 10h14" />
                <path d="M5 21h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
              </svg>
              <span className="text-xs">Note</span>
            </Button>
            <Button
              variant={blockType === "goal" ? "default" : "outline"}
              onClick={() => setBlockType("goal")}
              className="flex flex-col items-center p-3 h-auto"
            >
              <Flag className="h-5 w-5 mb-1" />
              <span className="text-xs">Goal</span>
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid w-full gap-1.5">
              <Label htmlFor={blockType === "note" ? "title" : "subject"}>
                {blockType === "note" ? "Title" : blockType === "goal" ? "Goal" : "Subject"}
              </Label>
              <Input
                id={blockType === "note" ? "title" : "subject"}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder={blockType === "note" ? "e.g., Chemistry Notes" : blockType === "goal" ? "e.g., Complete Math Assignment" : "e.g., Mathematics"}
                required
              />
            </div>

            {blockType !== "note" && (
              <div className="grid w-full gap-1.5">
                <Label htmlFor="topic">{blockType === "goal" ? "Description" : "Topic"}</Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder={blockType === "goal" ? "e.g., Finish all 10 problems" : "e.g., Calculus Chapter 5"}
                />
              </div>
            )}

            {blockType === "study" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid w-full gap-1.5">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid w-full gap-1.5">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: Priority) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {blockType === "goal" && (
              <div className="grid w-full gap-1.5">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBlockButton;
