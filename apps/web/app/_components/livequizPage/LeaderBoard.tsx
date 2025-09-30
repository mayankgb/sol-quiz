"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLeaderBoardStore, LeaderBoard } from '@/store/liveQuiz';


export default function Leaderboard() {

  const [leaderboardData, setLeaderboardData] = useState<LeaderBoard[]>([]);

  const { leaderBoard } = useLeaderBoardStore()

  // Initial sort of leaderboard by score (highest first)
  useEffect(() => {
    const sortedData = [...leaderBoard].sort((a, b) => b.points - a.points);
    setLeaderboardData(sortedData);
  }, []);

  // Find the highest score to calculate percentages
  const maxScore = leaderboardData.length > 0 ? leaderboardData[0]!.points : 100;

  return (
    <div className=" rounded-lg h-screen flex items-center justify-center  mx-auto">
      <div className='w-[90%] mx-auto'>
        <h2 className="text-2xl font-bold text-center mb-6 text-indigo-700">Quiz Leaderboard</h2>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {leaderBoard.map((player, index) => {
              // Calculate width percentage based on highest score
              const widthPercentage = (player.points / maxScore) * 100;

              return (
                <motion.div
                  key={player.participantId}
                  className="relative w-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  layout
                  transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                >
                  {/* Rank badge */}
                  <motion.div
                    className="absolute -left-2 -top-2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md z-10"
                    layout
                  >
                    {index + 1}
                  </motion.div>

                  {/* Player bar */}
                  <div className="relative h-16 rounded-lg  overflow-hidden ">
                    {/* Dynamic width colored bar with animation */}
                    <motion.div
                      className={`absolute top-0 left-14 h-full rounded-2xl ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-700' : 'bg-indigo-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />

                    {/* Player info (stays on top of the colored bar) */}
                    <div className="absolute inset-0 flex items-center px-4 z-10">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-indigo-700 border-2 border-indigo-200">
                        {player.name[0]}
                      </div>

                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-800">{player.name}</p>
                      </div>

                      <motion.div
                        className="font-bold text-gray-800"
                        key={player.points}
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5 }}
                      >
                        {player.points}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>


    </div>
  );
}