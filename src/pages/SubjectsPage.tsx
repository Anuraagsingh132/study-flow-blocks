
import React, { useState, useEffect } from "react";
import { Plus, BookOpen, Check, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Subject } from "@/types";
import { getSubjects, createSubject, updateSubject, deleteSubject, updateChapterCompletion } from "@/services/supabase/subjects";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6B9BF2");
  const [totalChapters, setTotalChapters] = useState(1);
  const [completedChapters, setCompletedChapters] = useState(0);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await getSubjects();
      setSubjects(data);
    } catch (error) {
      toast.error("Failed to load subjects");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    try {
      const newSubject = await createSubject({
        name,
        color,
        total_chapters: totalChapters,
        completed_chapters: completedChapters
      });
      
      setSubjects([...subjects, newSubject]);
      resetForm();
      setIsAddDialogOpen(false);
      toast.success("Subject added successfully");
    } catch (error) {
      toast.error("Failed to add subject");
      console.error(error);
    }
  };

  const handleEditSubject = async () => {
    if (!currentSubject) return;
    
    try {
      await updateSubject(currentSubject.id, {
        name,
        color,
        total_chapters: totalChapters,
        completed_chapters: completedChapters
      });
      
      setSubjects(subjects.map(subject => 
        subject.id === currentSubject.id 
          ? {
              ...subject,
              name,
              color,
              totalChapters,
              completedChapters,
              progress: totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0
            } 
          : subject
      ));
      
      resetForm();
      setIsEditDialogOpen(false);
      toast.success("Subject updated successfully");
    } catch (error) {
      toast.error("Failed to update subject");
      console.error(error);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      try {
        await deleteSubject(id);
        setSubjects(subjects.filter(subject => subject.id !== id));
        toast.success("Subject deleted successfully");
      } catch (error) {
        toast.error("Failed to delete subject");
        console.error(error);
      }
    }
  };

  const openEditDialog = (subject: Subject) => {
    setCurrentSubject(subject);
    setName(subject.name);
    setColor(subject.color);
    setTotalChapters(subject.totalChapters);
    setCompletedChapters(subject.completedChapters);
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setName("");
    setColor("#6B9BF2");
    setTotalChapters(1);
    setCompletedChapters(0);
    setCurrentSubject(null);
  };

  const handleUpdateCompletion = async (subject: Subject, increment: boolean) => {
    let newCompletedChapters = subject.completedChapters;
    
    if (increment && newCompletedChapters < subject.totalChapters) {
      newCompletedChapters += 1;
    } else if (!increment && newCompletedChapters > 0) {
      newCompletedChapters -= 1;
    } else {
      return; // Don't update if outside bounds
    }
    
    try {
      await updateChapterCompletion(subject.id, newCompletedChapters, subject.totalChapters);
      
      setSubjects(subjects.map(s => 
        s.id === subject.id 
          ? {
              ...s,
              completedChapters: newCompletedChapters,
              progress: Math.round((newCompletedChapters / s.totalChapters) * 100)
            } 
          : s
      ));
    } catch (error) {
      toast.error("Failed to update progress");
      console.error(error);
    }
  };

  // Color options for the subject color picker
  const colorOptions = [
    "#6B9BF2", // Blue
    "#F26B9B", // Pink
    "#9B6BF2", // Purple
    "#6BF29B", // Green
    "#F2D16B", // Yellow
    "#F29B6B", // Orange
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Subjects</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid w-full gap-2">
                <Label htmlFor="name">Subject Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div className="grid w-full gap-2">
                <Label>Subject Color</Label>
                <div className="flex gap-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`h-8 w-8 rounded-full ${
                        color === c ? "ring-2 ring-offset-2 ring-black" : ""
                      }`}
                      style={{ backgroundColor: c }}
                      type="button"
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid w-full gap-2">
                  <Label htmlFor="total">Total Chapters</Label>
                  <Input
                    id="total"
                    type="number"
                    min="1"
                    value={totalChapters}
                    onChange={(e) => setTotalChapters(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="grid w-full gap-2">
                  <Label htmlFor="completed">Completed Chapters</Label>
                  <Input
                    id="completed"
                    type="number"
                    min="0"
                    max={totalChapters}
                    value={completedChapters}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setCompletedChapters(Math.min(value, totalChapters));
                    }}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSubject} disabled={!name}>
                Add Subject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-xl font-medium text-gray-600">No subjects yet</h3>
          <p className="text-gray-500 mb-6">Add your first subject to get started</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Subject
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: subject.color }}
                  >
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-medium text-lg">{subject.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditDialog(subject)}
                    className="text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteSubject(subject.id)}
                    className="text-gray-500 hover:text-red-500 rounded-full p-1 hover:bg-gray-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-500">{subject.progress}%</span>
              </div>
              <Progress value={subject.progress} className="h-2 mb-4" />

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  {subject.completedChapters} of {subject.totalChapters} chapters
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUpdateCompletion(subject, false)}
                    className="rounded-full p-1 hover:bg-gray-100 text-gray-500"
                    disabled={subject.completedChapters <= 0}
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleUpdateCompletion(subject, true)}
                    className="rounded-full p-1 hover:bg-gray-100 text-green-600"
                    disabled={subject.completedChapters >= subject.totalChapters}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Subject Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="edit-name">Subject Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid w-full gap-2">
              <Label>Subject Color</Label>
              <div className="flex gap-2">
                {colorOptions.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full ${
                      color === c ? "ring-2 ring-offset-2 ring-black" : ""
                    }`}
                    style={{ backgroundColor: c }}
                    type="button"
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid w-full gap-2">
                <Label htmlFor="edit-total">Total Chapters</Label>
                <Input
                  id="edit-total"
                  type="number"
                  min="1"
                  value={totalChapters}
                  onChange={(e) => setTotalChapters(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="grid w-full gap-2">
                <Label htmlFor="edit-completed">Completed Chapters</Label>
                <Input
                  id="edit-completed"
                  type="number"
                  min="0"
                  max={totalChapters}
                  value={completedChapters}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setCompletedChapters(Math.min(value, totalChapters));
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubject}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubjectsPage;
