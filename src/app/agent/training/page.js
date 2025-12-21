'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@/appwrite';
import {
    TRAINING_MODULES,
    BADGES,
    MODULE_TYPES,
    getTrainingProgress,
    saveTrainingProgress,
    recordQuizAttempt,
    completeModule,
    generateCertificateData,
    syncProgressToCloud,
    getAgentProfile,
    certifyAgent,
    getOverallProgress,
    isModuleUnlocked,
    formatTimeSpent,
} from '@/lib/agent_training';
import { downloadCertificatePDF } from '@/lib/certificate';
import {
    Loader2, PlayCircle, CheckCircle, Award, Lock, BookOpen,
    Timer, Trophy, Star, Download, Shield, AlertTriangle,
    ChevronRight, ChevronLeft, Clock, Target, Zap, Medal,
    FileText, Video, MessageSquare, Puzzle
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// TIMER COMPONENT
// ============================================================================
function QuizTimer({ timeLimit, onTimeUp, isActive }) {
    const [timeLeft, setTimeLeft] = useState(timeLimit);

    useEffect(() => {
        if (!isActive) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive, onTimeUp]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isWarning = timeLeft < 30;

    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-bold ${isWarning
            ? 'bg-red-100 text-red-600 animate-pulse'
            : 'bg-slate-100 text-slate-700'
            }`}>
            <Timer className="w-5 h-5" />
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
    );
}

// ============================================================================
// BADGE NOTIFICATION
// ============================================================================
function BadgeUnlocked({ badge, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl animate-bounce-in">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-200 animate-pulse">
                    <span className="text-5xl">{badge.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Badge Unlocked!</h3>
                <h4 className="text-xl text-amber-600 font-bold mb-3">{badge.name}</h4>
                <p className="text-slate-500 mb-6">{badge.description}</p>
                <button
                    onClick={onClose}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                    Awesome! Continue
                </button>
            </div>
        </div>
    );
}

// ============================================================================
// SCENARIO COMPONENT
// ============================================================================
function ScenarioPlayer({ scenario, onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [score, setScore] = useState(0);

    const step = scenario.steps[currentStep];
    const isLastStep = currentStep === scenario.steps.length - 1;

    const handleOptionSelect = (optionIndex) => {
        if (showFeedback) return;
        setSelectedOption(optionIndex);
    };

    const handleNext = () => {
        if (!showFeedback) {
            // First click: show feedback
            setShowFeedback(true);
            if (step.options[selectedOption].correct) {
                setScore(prev => prev + 1);
            }
        } else {
            // Second click: go to next or complete
            if (isLastStep) {
                const finalScore = Math.round((score + (step.options[selectedOption]?.correct ? 1 : 0)) / scenario.steps.length * 100);
                onComplete(finalScore);
            } else {
                setCurrentStep(prev => prev + 1);
                setSelectedOption(null);
                setShowFeedback(false);
            }
        }
    };

    return (
        <div className="p-8">
            {/* Progress */}
            <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-slate-500">
                    Step {currentStep + 1} of {scenario.steps.length}
                </span>
                <div className="flex gap-1">
                    {scenario.steps.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-8 h-2 rounded-full transition-colors ${idx < currentStep ? 'bg-emerald-500' :
                                idx === currentStep ? 'bg-emerald-300' :
                                    'bg-slate-200'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Scenario Context */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 mb-8 text-white">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                        <Puzzle className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-2">Situation</h4>
                        <p className="text-slate-300 leading-relaxed">{step.situation}</p>
                    </div>
                </div>
            </div>

            {/* Question */}
            <h3 className="text-xl font-bold text-slate-900 mb-6">{step.question}</h3>

            {/* Options */}
            <div className="space-y-3 mb-8">
                {step.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const showResult = showFeedback && isSelected;
                    const isCorrect = opt.correct;

                    return (
                        <button
                            key={idx}
                            onClick={() => handleOptionSelect(idx)}
                            disabled={showFeedback}
                            className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${showResult
                                ? isCorrect
                                    ? 'border-emerald-500 bg-emerald-50'
                                    : 'border-red-500 bg-red-50'
                                : isSelected
                                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-200'
                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`font-medium ${showResult && isCorrect ? 'text-emerald-700' :
                                    showResult && !isCorrect ? 'text-red-700' :
                                        'text-slate-700'
                                    }`}>
                                    {opt.text}
                                </span>
                                {showResult && (
                                    isCorrect
                                        ? <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        : <AlertTriangle className="w-5 h-5 text-red-500" />
                                )}
                            </div>
                            {showResult && (
                                <p className={`mt-3 text-sm ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {opt.feedback}
                                </p>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Next Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleNext}
                    disabled={selectedOption === null}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {showFeedback
                        ? (isLastStep ? 'Complete Scenario' : 'Next Step')
                        : 'Check Answer'
                    }
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

// ============================================================================
// CERTIFICATE COMPONENT
// ============================================================================
function CertificatePreview({ agentName, onDownload, onClose }) {
    const certData = generateCertificateData(agentName);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-auto">
            <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl animate-fade-in">
                {/* Certificate */}
                <div className="p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-t-3xl border-b-4 border-emerald-500">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Shield className="w-8 h-8 text-emerald-600" />
                            <span className="text-emerald-600 font-bold text-lg">LANDSALE.LK</span>
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900 mb-2">Certificate of Completion</h2>
                        <p className="text-slate-500">Professional Agent Training Program</p>
                    </div>

                    <div className="my-8 text-center">
                        <p className="text-slate-500 mb-2">This is to certify that</p>
                        <h3 className="text-3xl font-bold text-slate-900 mb-2">{certData.recipientName}</h3>
                        <p className="text-slate-500">has successfully completed the</p>
                        <p className="text-xl font-bold text-emerald-600 mt-2">Agent Training Academy</p>
                    </div>

                    <div className="grid grid-cols-3 gap-6 my-8">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-slate-900">{certData.modulesCompleted}</div>
                            <div className="text-sm text-slate-500">Modules Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-slate-900">{certData.badges.length}</div>
                            <div className="text-sm text-slate-500">Badges Earned</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-slate-900">{formatTimeSpent(certData.totalTimeSpent)}</div>
                            <div className="text-sm text-slate-500">Time Invested</div>
                        </div>
                    </div>

                    <div className="flex justify-between items-end text-sm text-slate-500 pt-8 border-t border-slate-200">
                        <div>
                            <p>Certificate #: {certData.certificateNumber}</p>
                            <p>Issued: {certData.completionDate}</p>
                        </div>
                        <div className="text-right">
                            <p>Verify at:</p>
                            <p className="text-emerald-600">{certData.verificationUrl}</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={onDownload}
                        className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function AdvancedAgentTrainingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [agentProfile, setAgentProfile] = useState(null);
    const [progress, setProgress] = useState(getTrainingProgress());

    // Module state
    const [activeModuleIndex, setActiveModuleIndex] = useState(0);
    const [viewMode, setViewMode] = useState('content'); // 'content' | 'quiz' | 'scenario' | 'results'
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [quizStartTime, setQuizStartTime] = useState(null);
    const [timerActive, setTimerActive] = useState(false);

    // UI state
    const [showBadgeModal, setShowBadgeModal] = useState(null);
    const [showCertificate, setShowCertificate] = useState(false);
    const [certifying, setCertifying] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const activeModule = TRAINING_MODULES[activeModuleIndex];
    const isModuleCompleted = progress.completedModules.includes(activeModule?.id);
    const allModulesCompleted = progress.completedModules.length === TRAINING_MODULES.length;
    const overallProgress = getOverallProgress();

    // Initialize
    useEffect(() => {
        const init = async () => {
            try {
                const u = await account.get();
                setUser(u);
                const profile = await getAgentProfile(u.$id);
                setAgentProfile(profile);

                // Check first login badge
                const currentProgress = getTrainingProgress();
                if (!currentProgress.badges.includes('first_login')) {
                    currentProgress.badges.push('first_login');
                    saveTrainingProgress(currentProgress);
                    setProgress({ ...currentProgress });
                    setTimeout(() => setShowBadgeModal(BADGES.FIRST_LOGIN), 500);
                }
            } catch (e) {
                console.error(e);
                router.push('/auth/login');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [router]);

    // Handle quiz submission
    const handleQuizSubmit = useCallback(() => {
        const timeSpent = quizStartTime ? Math.round((Date.now() - quizStartTime) / 1000) : 0;
        let correctCount = 0;

        activeModule.questions.forEach(q => {
            if (quizAnswers[q.id] === q.correctAnswer) {
                correctCount++;
            }
        });

        const score = Math.round((correctCount / activeModule.questions.length) * 100);
        const passed = score >= activeModule.requiredScore;

        recordQuizAttempt(activeModule.id, score, timeSpent);
        setQuizResult({ score, passed, correctCount, total: activeModule.questions.length, timeSpent });
        setTimerActive(false);
        setViewMode('results');

        if (passed) {
            const { newBadges } = completeModule(activeModule.id, score, timeSpent);
            setProgress(getTrainingProgress());

            if (newBadges.length > 0) {
                setTimeout(() => setShowBadgeModal(newBadges[0]), 1000);
            }
        }
    }, [activeModule, quizAnswers, quizStartTime]);

    // Handle scenario completion
    const handleScenarioComplete = (score) => {
        const passed = score >= activeModule.requiredScore;
        setQuizResult({ score, passed, isScenario: true });
        setViewMode('results');

        if (passed) {
            const { newBadges } = completeModule(activeModule.id, score, 0);
            setProgress(getTrainingProgress());

            if (newBadges.length > 0) {
                setTimeout(() => setShowBadgeModal(newBadges[0]), 1000);
            }
        }
    };

    // Start quiz
    const startQuiz = () => {
        setViewMode('quiz');
        setQuizAnswers({});
        setQuizResult(null);
        setQuizStartTime(Date.now());
        if (activeModule.timedQuiz) {
            setTimerActive(true);
        }
    };

    // Start scenario
    const startScenario = () => {
        setViewMode('scenario');
        setQuizResult(null);
    };

    // Handle certification
    const handleCertification = async () => {
        if (!agentProfile) return;
        setCertifying(true);
        setSyncing(true);

        try {
            await syncProgressToCloud(user.$id);
            await certifyAgent(agentProfile.$id);
            toast.success("Congratulations! You are now a Certified Agent.");
            setShowCertificate(true);
        } catch (e) {
            toast.error("Failed to update status. Please try again.");
        } finally {
            setCertifying(false);
            setSyncing(false);
        }
    };

    // Download certificate
    const handleDownloadCertificate = () => {
        try {
            const certData = generateCertificateData(user?.name || 'Agent');
            downloadCertificatePDF(certData);
            toast.success("Certificate downloaded!");
        } catch (e) {
            console.error(e);
            toast.error("Failed to generate PDF. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
                    <p className="text-white font-bold">Loading Training Academy...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                                    <Award className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold">Agent Training Academy</h1>
                            </div>
                            <p className="text-slate-400">Master the skills to become a certified property professional</p>
                        </div>

                        {/* Progress Stats */}
                        <div className="flex gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-emerald-400">{overallProgress}%</div>
                                <div className="text-xs text-slate-400">Complete</div>
                            </div>
                            <div className="w-px bg-slate-700" />
                            <div className="text-center">
                                <div className="text-3xl font-bold text-amber-400">{progress.badges.length}</div>
                                <div className="text-xs text-slate-400">Badges</div>
                            </div>
                            <div className="w-px bg-slate-700" />
                            <div className="text-center">
                                <div className="text-3xl font-bold text-white">{formatTimeSpent(progress.totalTimeSpent)}</div>
                                <div className="text-xs text-slate-400">Time Spent</div>
                            </div>
                        </div>
                    </div>

                    {/* Overall Progress Bar */}
                    <div className="mt-6">
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                                style={{ width: `${overallProgress}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-slate-500">
                            <span>Start</span>
                            <span>Certification</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Sidebar: Modules & Badges */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Modules List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-emerald-600" />
                                Training Modules
                            </h3>
                            <div className="space-y-3">
                                {TRAINING_MODULES.map((module, idx) => {
                                    const isCompleted = progress.completedModules.includes(module.id);
                                    const isActive = idx === activeModuleIndex;
                                    const isLocked = false; // All modules accessible
                                    const attempt = progress.quizAttempts[module.id];

                                    const getIcon = () => {
                                        switch (module.type) {
                                            case MODULE_TYPES.VIDEO: return <Video className="w-4 h-4" />;
                                            case MODULE_TYPES.READING: return <FileText className="w-4 h-4" />;
                                            case MODULE_TYPES.SCENARIO: return <Puzzle className="w-4 h-4" />;
                                            default: return <PlayCircle className="w-4 h-4" />;
                                        }
                                    };

                                    return (
                                        <button
                                            key={module.id}
                                            onClick={() => {
                                                setActiveModuleIndex(idx);
                                                setViewMode('content');
                                                setQuizResult(null);
                                                setQuizAnswers({});
                                            }}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all group cursor-pointer ${isActive
                                                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                                                : isCompleted
                                                    ? 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-300'
                                                    : 'border-slate-100 hover:border-emerald-200 bg-white hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-100 text-emerald-600' :
                                                    isActive ? 'bg-emerald-500 text-white' :
                                                        'bg-slate-100 text-slate-400'
                                                    }`}>
                                                    {isCompleted
                                                        ? <CheckCircle className="w-5 h-5" />
                                                        : getIcon()
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-xs font-bold ${isActive ? 'text-emerald-600' : 'text-slate-400'
                                                            }`}>
                                                            MODULE {idx + 1}
                                                        </span>
                                                        {module.timedQuiz && (
                                                            <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded text-[10px] font-bold">
                                                                TIMED
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className={`font-semibold text-sm truncate ${isActive ? 'text-emerald-700' : 'text-slate-700'
                                                        }`}>
                                                        {module.title}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {module.duration}
                                                        </span>
                                                        {attempt && (
                                                            <span className="flex items-center gap-1">
                                                                <Target className="w-3 h-3" />
                                                                Best: {attempt.bestScore}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Badges Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-500" />
                                Earned Badges
                            </h3>
                            <div className="grid grid-cols-4 gap-3">
                                {Object.values(BADGES).map(badge => {
                                    const isEarned = progress.badges.includes(badge.id);
                                    return (
                                        <div
                                            key={badge.id}
                                            className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all ${isEarned
                                                ? 'bg-gradient-to-br from-amber-100 to-amber-50 border-2 border-amber-200'
                                                : 'bg-slate-100 grayscale opacity-30'
                                                }`}
                                            title={isEarned ? badge.name : 'Locked'}
                                        >
                                            {badge.icon}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Certification Status */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
                            <div className="flex items-center justify-center mb-4">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${allModulesCompleted
                                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 animate-pulse'
                                    : 'bg-slate-700'
                                    }`}>
                                    <Medal className={`w-8 h-8 ${allModulesCompleted ? 'text-white' : 'text-slate-500'}`} />
                                </div>
                            </div>
                            <h4 className="font-bold text-center mb-2">Certification</h4>
                            <p className="text-xs text-slate-400 text-center mb-4">
                                {allModulesCompleted
                                    ? "You've completed all training! Claim your certificate."
                                    : `Complete ${TRAINING_MODULES.length - progress.completedModules.length} more modules`
                                }
                            </p>
                            <button
                                onClick={handleCertification}
                                disabled={!allModulesCompleted || certifying}
                                className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${allModulesCompleted
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg'
                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    }`}
                            >
                                {certifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                                {certifying ? 'Processing...' : 'Get Certified'}
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">

                            {/* Content View */}
                            {viewMode === 'content' && (
                                <>
                                    {/* Video/Content Header */}
                                    <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 relative flex items-center justify-center">
                                        {activeModule.type === MODULE_TYPES.VIDEO ? (
                                            <>
                                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070')] bg-cover bg-center opacity-30" />
                                                <button
                                                    onClick={activeModule.type === MODULE_TYPES.SCENARIO ? startScenario : startQuiz}
                                                    className="relative z-10 w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-transform group"
                                                >
                                                    <PlayCircle className="w-12 h-12 text-white group-hover:text-emerald-400 transition-colors" />
                                                </button>
                                            </>
                                        ) : activeModule.type === MODULE_TYPES.SCENARIO ? (
                                            <div className="text-center z-10 relative">
                                                <Puzzle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                                                <h3 className="text-2xl font-bold text-white mb-2">{activeModule.scenario?.title}</h3>
                                                <p className="text-slate-400 max-w-md mx-auto mb-6">{activeModule.description}</p>
                                                <button
                                                    onClick={startScenario}
                                                    className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold"
                                                >
                                                    Start Scenario
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-center z-10 relative p-8">
                                                <FileText className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                                                <h3 className="text-2xl font-bold text-white">{activeModule.title}</h3>
                                            </div>
                                        )}
                                        <div className="absolute bottom-4 left-4 flex items-center gap-3 z-10">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${activeModule.timedQuiz
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-white/20 text-white backdrop-blur-sm'
                                                }`}>
                                                {activeModule.timedQuiz ? `⏱ Timed: ${activeModule.quizTimeLimit}s` : activeModule.duration}
                                            </span>
                                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-lg text-xs font-bold">
                                                Pass: {activeModule.requiredScore}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Module Description */}
                                    <div className="p-8">
                                        <h2 className="text-2xl font-bold text-slate-900 mb-4">{activeModule.title}</h2>
                                        <p className="text-slate-600 mb-6 leading-relaxed">{activeModule.description}</p>

                                        {/* Reading Content */}
                                        {activeModule.type === MODULE_TYPES.READING && activeModule.content && (
                                            <div className="prose prose-slate max-w-none mb-8 bg-slate-50 rounded-2xl p-6">
                                                <div dangerouslySetInnerHTML={{ __html: activeModule.content.replace(/\n/g, '<br/>').replace(/##\s(.*)/g, '<h3 class="text-lg font-bold mt-4">$1</h3>').replace(/###\s(.*)/g, '<h4 class="font-semibold mt-3">$1</h4>') }} />
                                            </div>
                                        )}

                                        <div className="flex gap-4">
                                            {activeModule.type === MODULE_TYPES.SCENARIO ? (
                                                <button
                                                    onClick={startScenario}
                                                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                                                >
                                                    <Puzzle className="w-5 h-5" />
                                                    Start Scenario
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={startQuiz}
                                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                                                >
                                                    <Zap className="w-5 h-5" />
                                                    {isModuleCompleted ? 'Retake Quiz' : 'Take Quiz'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Quiz View */}
                            {viewMode === 'quiz' && (
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-bold text-slate-900">Module Quiz</h2>
                                        <div className="flex items-center gap-4">
                                            <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold">
                                                {activeModule.questions.length} Questions
                                            </span>
                                            {activeModule.timedQuiz && timerActive && (
                                                <QuizTimer
                                                    timeLimit={activeModule.quizTimeLimit}
                                                    onTimeUp={handleQuizSubmit}
                                                    isActive={timerActive}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        {activeModule.questions.map((q, idx) => (
                                            <div key={q.id} className="pb-6 border-b border-slate-100 last:border-0">
                                                <p className="font-semibold text-slate-900 mb-4 text-lg">
                                                    {idx + 1}. {q.text}
                                                </p>
                                                <div className="space-y-3">
                                                    {q.options.map((opt, optIdx) => (
                                                        <label
                                                            key={optIdx}
                                                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${quizAnswers[q.id] === optIdx
                                                                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                                                                : 'border-slate-200 hover:border-slate-300'
                                                                }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={q.id}
                                                                checked={quizAnswers[q.id] === optIdx}
                                                                onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                                                                className="w-5 h-5 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                                                            />
                                                            <span className="text-slate-700">{opt}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end pt-6">
                                        <button
                                            onClick={handleQuizSubmit}
                                            disabled={Object.keys(quizAnswers).length !== activeModule.questions.length}
                                            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Submit Answers
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Scenario View */}
                            {viewMode === 'scenario' && activeModule.scenario && (
                                <ScenarioPlayer
                                    scenario={activeModule.scenario}
                                    onComplete={handleScenarioComplete}
                                />
                            )}

                            {/* Results View */}
                            {viewMode === 'results' && quizResult && (
                                <div className="p-8 text-center">
                                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${quizResult.passed
                                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                                        : 'bg-gradient-to-br from-red-400 to-rose-500'
                                        }`}>
                                        {quizResult.passed
                                            ? <CheckCircle className="w-12 h-12 text-white" />
                                            : <AlertTriangle className="w-12 h-12 text-white" />
                                        }
                                    </div>
                                    <h2 className={`text-3xl font-bold mb-2 ${quizResult.passed ? 'text-emerald-600' : 'text-slate-800'
                                        }`}>
                                        {quizResult.passed ? 'Congratulations!' : 'Not Quite'}
                                    </h2>
                                    <p className="text-slate-500 mb-8">
                                        {quizResult.passed
                                            ? 'You passed this module!'
                                            : `You need ${activeModule.requiredScore}% to pass. Keep trying!`
                                        }
                                    </p>

                                    <div className="flex justify-center gap-8 mb-8">
                                        <div className="text-center">
                                            <div className="text-4xl font-bold text-slate-900">{quizResult.score}%</div>
                                            <div className="text-sm text-slate-500">Score</div>
                                        </div>
                                        {!quizResult.isScenario && (
                                            <>
                                                <div className="w-px bg-slate-200" />
                                                <div className="text-center">
                                                    <div className="text-4xl font-bold text-slate-900">
                                                        {quizResult.correctCount}/{quizResult.total}
                                                    </div>
                                                    <div className="text-sm text-slate-500">Correct</div>
                                                </div>
                                                <div className="w-px bg-slate-200" />
                                                <div className="text-center">
                                                    <div className="text-4xl font-bold text-slate-900">
                                                        {Math.round(quizResult.timeSpent)}s
                                                    </div>
                                                    <div className="text-sm text-slate-500">Time</div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex justify-center gap-4">
                                        {quizResult.passed ? (
                                            <button
                                                onClick={() => {
                                                    const nextIdx = activeModuleIndex + 1;
                                                    if (nextIdx < TRAINING_MODULES.length) {
                                                        setActiveModuleIndex(nextIdx);
                                                        setViewMode('content');
                                                    }
                                                }}
                                                disabled={activeModuleIndex >= TRAINING_MODULES.length - 1}
                                                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                                            >
                                                Next Module <ChevronRight className="w-5 h-5" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setViewMode('content');
                                                    setQuizResult(null);
                                                    setQuizAnswers({});
                                                }}
                                                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                                            >
                                                Review & Try Again
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Badge Unlock Modal */}
            {showBadgeModal && (
                <BadgeUnlocked
                    badge={showBadgeModal}
                    onClose={() => setShowBadgeModal(null)}
                />
            )}

            {/* Certificate Modal */}
            {showCertificate && (
                <CertificatePreview
                    agentName={user?.name || 'Agent'}
                    onDownload={handleDownloadCertificate}
                    onClose={() => setShowCertificate(false)}
                />
            )}
        </div>
    );
}
