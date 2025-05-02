
import { StudyBlock, Note, Goal, Subject, Priority } from "@/types";

const generateId = () => Math.random().toString(36).substring(2, 10);

export const generateSampleBlocks = (): StudyBlock[] => {
  const currentDate = new Date();
  const subjects = ["Mathematics", "Physics", "Computer Science", "Biology", "Chemistry", "Literature"];
  const topics = {
    "Mathematics": ["Calculus", "Linear Algebra", "Statistics", "Geometry"],
    "Physics": ["Mechanics", "Electromagnetism", "Thermodynamics", "Quantum Physics"],
    "Computer Science": ["Algorithms", "Data Structures", "Machine Learning", "Web Development"],
    "Biology": ["Cell Biology", "Genetics", "Ecology", "Physiology"],
    "Chemistry": ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Biochemistry"],
    "Literature": ["Poetry", "Novel Analysis", "Literary Theory", "Creative Writing"]
  };
  
  const priorities: Priority[] = ["low", "medium", "high"];
  
  const blocks: StudyBlock[] = [];
  
  // Generate blocks for today
  for (let i = 0; i < 5; i++) {
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const topicList = topics[subject as keyof typeof topics];
    const topic = topicList[Math.floor(Math.random() * topicList.length)];
    
    const startHour = 9 + Math.floor(Math.random() * 8);
    const startTime = `${startHour.toString().padStart(2, "0")}:00`;
    const endTime = `${(startHour + 1).toString().padStart(2, "0")}:00`;
    
    blocks.push({
      id: generateId(),
      subject,
      topic,
      startTime,
      endTime,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      completed: Math.random() > 0.7
    });
  }
  
  return blocks.sort((a, b) => {
    const timeA = parseInt(a.startTime.split(":")[0]);
    const timeB = parseInt(b.startTime.split(":")[0]);
    return timeA - timeB;
  });
};

export const generateSampleNotes = (): Note[] => {
  const notes: Note[] = [
    {
      id: generateId(),
      title: "Physics Formulas",
      content: "# Key Physics Formulas\n\n## Kinematics\n- $v = u + at$\n- $s = ut + \\frac{1}{2}at^2$\n- $v^2 = u^2 + 2as$\n\n## Newton's Laws\n- $F = ma$\n- $F_{12} = -F_{21}$",
      tags: ["physics", "formulas", "reference"],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: generateId(),
      title: "Biology Class Notes",
      content: "# Cell Structure\n\n- **Cell Membrane**: Controls what enters and exits the cell\n- **Nucleus**: Contains genetic material\n- **Mitochondria**: Powerhouse of the cell\n- **Endoplasmic Reticulum**: Protein synthesis and transport\n\n> Note: Review diagrams in textbook page 42",
      tags: ["biology", "cells", "class-notes"],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: generateId(),
      title: "Math Test Preparation",
      content: "## Topics to Study\n\n- [x] Integration techniques\n- [x] Partial fractions\n- [ ] Differential equations\n- [ ] Series convergence tests\n\n### Example Problems\n1. Solve $\\int x^2 \\sin(x) dx$\n2. Test the convergence of $\\sum_{n=1}^{\\infty} \\frac{n}{n^2+1}$",
      tags: ["math", "test-prep", "calculus"],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  
  return notes;
};

export const generateSampleGoals = (): Goal[] => {
  const goals: Goal[] = [
    {
      id: generateId(),
      title: "Complete Calculus Assignment",
      description: "Finish all problems in Chapter 5 assignment",
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false,
      progress: 70,
      steps: [
        { id: generateId(), title: "Problems 1-5", completed: true },
        { id: generateId(), title: "Problems 6-10", completed: true },
        { id: generateId(), title: "Problems 11-15", completed: false },
        { id: generateId(), title: "Review work", completed: false }
      ]
    },
    {
      id: generateId(),
      title: "Prepare Chemistry Lab Report",
      description: "Write up findings from last week's experiment",
      deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false,
      progress: 30,
      steps: [
        { id: generateId(), title: "Analyze data", completed: true },
        { id: generateId(), title: "Create graphs", completed: false },
        { id: generateId(), title: "Write discussion section", completed: false },
        { id: generateId(), title: "Proofread", completed: false }
      ]
    },
    {
      id: generateId(),
      title: "Study for History Exam",
      description: "Review all materials from Chapters 7-10",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      completed: false,
      progress: 10,
      steps: [
        { id: generateId(), title: "Review Chapter 7", completed: true },
        { id: generateId(), title: "Review Chapter 8", completed: false },
        { id: generateId(), title: "Review Chapter 9", completed: false },
        { id: generateId(), title: "Review Chapter 10", completed: false },
        { id: generateId(), title: "Practice with old exams", completed: false }
      ]
    }
  ];
  
  return goals;
};

export const generateSampleSubjects = (): Subject[] => {
  const subjects: Subject[] = [
    {
      id: generateId(),
      name: "Mathematics",
      color: "#6B9BF2",
      progress: 65,
      totalChapters: 12,
      completedChapters: 8
    },
    {
      id: generateId(),
      name: "Physics",
      color: "#F26B9B",
      progress: 40,
      totalChapters: 10,
      completedChapters: 4
    },
    {
      id: generateId(),
      name: "Computer Science",
      color: "#9B6BF2",
      progress: 80,
      totalChapters: 15,
      completedChapters: 12
    },
    {
      id: generateId(),
      name: "Biology",
      color: "#6BF29B",
      progress: 30,
      totalChapters: 14,
      completedChapters: 4
    },
    {
      id: generateId(),
      name: "Chemistry",
      color: "#F2D16B",
      progress: 50,
      totalChapters: 8,
      completedChapters: 4
    }
  ];
  
  return subjects;
};
