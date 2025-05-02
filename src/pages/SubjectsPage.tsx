
import React, { useState, useEffect } from "react";
import { Plus, BookOpen, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Subject } from "@/types";
import { generateSampleSubjects } from "@/utils/sample-data";

const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    setSubjects(generateSampleSubjects());
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Subjects</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: subject.color }}
              >
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-medium text-lg">{subject.name}</h3>
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
              <div className="flex items-center text-green-600">
                <Check className="h-4 w-4 mr-1" />
                <span>{Math.round((subject.completedChapters / subject.totalChapters) * 100)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectsPage;
