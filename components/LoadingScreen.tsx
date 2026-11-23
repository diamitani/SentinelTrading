import React, { useEffect, useState } from 'react';

const tasks = [
  "Connecting to Global News Nodes...",
  "Scraping Top 100 Financial Headlines...",
  "Accessing Social Firehose (Twitter/Reddit)...",
  "Running Sentiment Analysis Models...",
  "Calculating Delta & Theta Decay...",
  "Synthesizing Strategic Alpha...",
];

export const LoadingScreen: React.FC = () => {
  const [currentTask, setCurrentTask] = useState(0);

  useEffect(() => {
    if (currentTask < tasks.length - 1) {
      const timeout = setTimeout(() => {
        setCurrentTask((prev) => prev + 1);
      }, 800); // Switch task every 800ms
      return () => clearTimeout(timeout);
    }
  }, [currentTask]);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-950 text-neon-green font-mono">
      <div className="w-64 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-800"></div>
        <div 
          className="h-1 bg-neon-green transition-all duration-300 ease-out"
          style={{ width: `${((currentTask + 1) / tasks.length) * 100}%` }}
        ></div>
      </div>
      
      <div className="mt-8 text-xl tracking-widest uppercase animate-pulse">
        System Initializing
      </div>
      
      <div className="mt-4 h-8 text-gray-400 text-sm">
        {tasks[currentTask]}
      </div>

      <div className="mt-12 grid grid-cols-4 gap-2 opacity-30">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="w-2 h-2 bg-neon-green rounded-full animate-ping" style={{ animationDelay: `${i * 0.1}s` }}></div>
        ))}
      </div>
    </div>
  );
};