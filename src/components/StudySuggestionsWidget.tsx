
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, BookOpen, Clock, ArrowRight } from "lucide-react";
import { getStudySuggestions, Suggestion } from "@/services/supabase/studySuggestions";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface StudySuggestionsWidgetProps {
  className?: string;
  onSelectSuggestion?: (suggestion: Suggestion) => void;
  limit?: number;
}

const StudySuggestionsWidget: React.FC<StudySuggestionsWidgetProps> = ({ 
  className, 
  onSelectSuggestion,
  limit = 3 
}) => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, [user]);

  const loadSuggestions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getStudySuggestions();
      setSuggestions(data.slice(0, limit));
    } catch (error) {
      console.error("Error loading study suggestions:", error);
      toast.error("Failed to load study suggestions");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-blue-500";
    }
  };

  const getIconForSuggestion = (suggestion: Suggestion) => {
    if (suggestion.id.includes("revision")) {
      return <Clock className="h-5 w-5" />;
    } else if (suggestion.id.includes("subject")) {
      return <BookOpen className="h-5 w-5" />;
    } else {
      return <Brain className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <Card className={`${className} min-h-[200px] flex items-center justify-center`}>
        <CardContent className="p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Sign in to see personalized study suggestions</p>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No study suggestions available right now</p>
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={loadSuggestions}
          >
            Refresh Suggestions
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Smart Study Suggestions
        </h3>
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <div 
              key={suggestion.id}
              className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {suggestion.subjectColor ? (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center" 
                      style={{ backgroundColor: suggestion.subjectColor }}
                    >
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    getIconForSuggestion(suggestion)
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${getUrgencyColor(suggestion.urgency)}`}
                    ></span>
                    {suggestion.reason}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          className="w-full mt-3 text-primary hover:text-primary hover:bg-primary/10"
          onClick={loadSuggestions}
        >
          Refresh
        </Button>
      </CardContent>
    </Card>
  );
};

export default StudySuggestionsWidget;
