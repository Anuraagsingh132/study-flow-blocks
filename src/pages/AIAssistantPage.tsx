
import React from "react";
import AIAssistant from "@/components/AIAssistant";

const AIAssistantPage = () => {
  return (
    <div className="container mx-auto py-6 h-full">
      <h1 className="text-2xl font-bold mb-6">Study AI Assistant</h1>
      <div className="h-[calc(100vh-12rem)]">
        <AIAssistant />
      </div>
    </div>
  );
};

export default AIAssistantPage;
