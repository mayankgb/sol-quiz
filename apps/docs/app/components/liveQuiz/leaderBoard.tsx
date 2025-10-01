"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLeaderBoardStore, LeaderBoard } from '@/store/quizstore';

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderBoard[]>([]);

  const { leaderBoard, userPoints, userPosition } = useLeaderBoardStore()

  useEffect(() => {
    const sortedData = [...leaderboardData].sort((a, b) => b.points - a.points);
    setLeaderboardData(sortedData);
  }, []);


  const maxScore = leaderboardData.length > 0 ? leaderboardData[0]!.points : 100;

  return (
    <div className="rounded-lg h-screen flex items-center justify-center mx-auto">
      <div className='w-[90%] mx-auto max-w-2xl'>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Quiz Leaderboard</h2>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {leaderBoard.map((player, index) => {

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

                  <motion.div
                    className="absolute -left-2 -top-2 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold shadow-md z-10"
                    layout
                  >
                    {index + 1}
                  </motion.div>


                  <div className="relative h-16 rounded-lg overflow-hidden">

                    <motion.div
                      className={`absolute top-0 left-14 h-full rounded-2xl ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : index === 2 ? 'bg-amber-600' : 'bg-gray-200'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />


                    <div className="absolute inset-0 flex items-center px-4 z-10">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-gray-900 border-2 border-gray-200">
                        {player.name[0]?.toUpperCase()}
                      </div>

                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">{player.name}</p>
                      </div>

                      <motion.div
                        className="font-bold text-gray-900"
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

        <p className="text-sm text-gray-400 mt-4 text-center">
          Updated in real-time
        </p>


       { (userPoints && userPosition ) && <motion.div
          className="mt-8 py-4 px-6 bg-white border border-gray-200 rounded-lg shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-bold">
                {"Y"}
              </div>
              <span className="text-sm text-gray-600">{"You"}</span>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-400">Position</p>
                <p className="text-lg font-bold text-gray-900">#{userPosition}</p>
              </div>

              <div className="h-8 w-px bg-gray-200"></div>

              <div className="text-right">
                <p className="text-xs text-gray-400">Points</p>
                <p className="text-lg font-bold text-emerald-600">{userPoints}</p>
              </div>
            </div>
          </div>
        </motion.div>}
      </div>
    </div>
  );
}

