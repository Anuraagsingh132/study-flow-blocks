
import React, { useState, useEffect } from "react";
import { Plus, Search, Tag, Clock, Trash2, Edit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Note } from "@/types";
import { getNotes, createNote, updateNote, deleteNote } from "@/services/supabase/notes";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  
  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await getNotes();
      setNotes(data);
    } catch (error) {
      toast.error("Failed to load notes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = searchQuery
    ? notes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : notes;

  const handleAddNote = async () => {
    try {
      const newNote = await createNote({
        title,
        content,
        tags
      });
      
      setNotes([newNote, ...notes]);
      resetForm();
      setIsAddDialogOpen(false);
      toast.success("Note added successfully");
    } catch (error) {
      toast.error("Failed to add note");
      console.error(error);
    }
  };

  const handleEditNote = async () => {
    if (!currentNote) return;
    
    try {
      await updateNote(currentNote.id, {
        title,
        content,
        tags
      });
      
      setNotes(notes.map(note => 
        note.id === currentNote.id 
          ? {
              ...note,
              title,
              content,
              tags,
              updatedAt: new Date().toISOString()
            } 
          : note
      ));
      
      resetForm();
      setIsEditDialogOpen(false);
      toast.success("Note updated successfully");
    } catch (error) {
      toast.error("Failed to update note");
      console.error(error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await deleteNote(id);
      setNotes(notes.filter(note => note.id !== id));
      
      // Close viewing dialog if the deleted note was being viewed
      if (viewingNote && viewingNote.id === id) {
        setViewingNote(null);
      }
      
      toast.success("Note deleted successfully");
    } catch (error) {
      toast.error("Failed to delete note");
      console.error(error);
    }
  };

  const openEditDialog = (note: Note) => {
    setCurrentNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTags([...note.tags]);
    setIsEditDialogOpen(true);
    
    // Close viewing dialog if it was open
    setViewingNote(null);
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setTagInput("");
    setTags([]);
    setCurrentNote(null);
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notes</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search notes..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          {searchQuery ? (
            <>
              <h3 className="text-xl font-medium text-gray-600">No notes found</h3>
              <p className="text-gray-500">Try adjusting your search</p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-medium text-gray-600">No notes yet</h3>
              <p className="text-gray-500 mb-6">Create your first note to get started</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Note
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer p-6"
              onClick={() => setViewingNote(note)}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-xl mb-2">{note.title}</h3>
                <div className="flex">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(note);
                    }}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Are you sure you want to delete this note?")) {
                        handleDeleteNote(note.id);
                      }
                    }}
                    className="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {note.content.length > 100
                  ? `${note.content.substring(0, 100)}...`
                  : note.content}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {note.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md flex items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
                      +{note.tags.length - 3}
                    </span>
                  )}
                </div>
                <div className="text-gray-400 text-xs flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Note Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
              />
            </div>
            <div className="grid w-full gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note..."
                className="min-h-[200px]"
              />
            </div>
            <div className="grid w-full gap-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags..."
                  onKeyDown={handleKeyDown}
                />
                <Button onClick={addTag} type="button" variant="outline">
                  Add
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetForm();
              setIsAddDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={!title || !content}>
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid w-full gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid w-full gap-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
            <div className="grid w-full gap-2">
              <Label htmlFor="edit-tags">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="edit-tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags..."
                  onKeyDown={handleKeyDown}
                />
                <Button onClick={addTag} type="button" variant="outline">
                  Add
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetForm();
              setIsEditDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditNote} disabled={!title || !content}>
              Update Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Note Dialog */}
      {viewingNote && (
        <Dialog open={!!viewingNote} onOpenChange={(open) => !open && setViewingNote(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{viewingNote.title}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{viewingNote.content}</p>
              </div>
              
              {viewingNote.tags.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {viewingNote.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6 text-right text-sm text-gray-500">
                Last updated: {new Date(viewingNote.updatedAt).toLocaleString()}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewingNote(null)}>
                Close
              </Button>
              <Button onClick={() => {
                openEditDialog(viewingNote);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default NotesPage;
