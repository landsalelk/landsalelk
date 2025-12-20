'use client';

import { useState, useEffect } from 'react';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { DB_ID } from '@/lib/constants';
import { BADGES } from '@/lib/agent_training';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Award, Shield, Zap, BookOpen, Star,
    CheckCircle2, Trophy, Crown, Medal,
    Sparkles, Flame, Target, Rocket
} from 'lucide-react';

const COLLECTION_TRAINING_PROGRESS = 'training_progress';

// Map badge IDs to Lucide icons
const BADGE_ICONS = {
    'module_master': BookOpen,
    'perfect_score': Star,
    'quick_learner': Zap,
    'speed_demon': Rocket,
    'ethics_champion': Shield,
    'legal_eagle': Scale,
    'scenario_solver': Target,
    'certified_pro': Award,
    'knowledge_seeker': Flame,
};

// Fallback icon
const DefaultIcon = Medal;

const Scale = (props) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
        <path d="M7 21h10" />
        <path d="M12 3v18" />
        <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
);

export function AgentBadges({ userId }) {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredBadge, setHoveredBadge] = useState(null);

    useEffect(() => {
        async function fetchBadges() {
            if (!userId) return;
            try {
                const response = await databases.listDocuments(
                    DB_ID,
                    COLLECTION_TRAINING_PROGRESS,
                    [Query.equal('user_id', userId)]
                );

                if (response.documents.length > 0) {
                    const doc = response.documents[0];
                    let badgeIds = [];
                    try {
                        badgeIds = JSON.parse(doc.badges || '[]');
                    } catch (e) {
                        console.error('Error parsing badges:', e);
                        badgeIds = [];
                    }

                    const earnedBadges = badgeIds.map(id => {
                        const badgeDef = Object.values(BADGES).find(b => b.id === id);
                        return badgeDef ? { ...badgeDef, icon: BADGE_ICONS[id] || DefaultIcon } : null;
                    }).filter(Boolean);

                    setBadges(earnedBadges);
                }
            } catch (error) {
                console.error('Failed to fetch badges:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchBadges();
    }, [userId]);

    if (loading) return (
        <div className="h-24 bg-slate-100/50 rounded-2xl animate-pulse" />
    );

    if (badges.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 overflow-hidden relative">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/20 to-orange-100/20 rounded-bl-full -z-0" />

            <div className="flex items-center gap-2 mb-6 relative z-10">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900">Earned Badges</h2>
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {badges.length}
                </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 relative z-10">
                {badges.map((badge, index) => (
                    <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: index * 0.1
                        }}
                        className="relative group"
                        onMouseEnter={() => setHoveredBadge(badge.id)}
                        onMouseLeave={() => setHoveredBadge(null)}
                    >
                        {/* Badge Card */}
                        <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-3 flex flex-col items-center justify-center gap-2 cursor-help transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:border-amber-200 group-hover:from-amber-50 group-hover:to-orange-50">

                            {/* Icon Container */}
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center shadow-sm relative
                                ${badge.color === 'gold' ? 'bg-gradient-to-br from-amber-300 to-yellow-500 text-white' : ''}
                                ${badge.color === 'silver' ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white' : ''}
                                ${badge.color === 'bronze' ? 'bg-gradient-to-br from-orange-300 to-orange-600 text-white' : ''}
                                ${!['gold', 'silver', 'bronze'].includes(badge.color) ? 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white' : ''}
                            `}>
                                <badge.icon className="w-5 h-5 drop-shadow-md" />

                                {/* Shine Effect */}
                                <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse-slow" />
                                <div className="absolute -top-1 -right-1">
                                    <Sparkles className="w-3 h-3 text-yellow-300 animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>

                            {/* Label */}
                            <span className="text-[10px] font-bold text-slate-600 text-center leading-tight line-clamp-2 group-hover:text-amber-700 transition-colors">
                                {badge.name}
                            </span>
                        </div>

                        {/* Tooltip */}
                        <AnimatePresence>
                            {hoveredBadge === badge.id && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-slate-900/95 backdrop-blur-sm text-white p-3 rounded-xl shadow-xl z-50 pointer-events-none"
                                >
                                    <div className="font-bold text-sm text-amber-300 mb-1 flex items-center gap-1.5">
                                        <Crown className="w-3 h-3" />
                                        {badge.name}
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        {badge.description}
                                    </p>

                                    {/* Arrow */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900/95" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
