"use client";

import { FileCheck, HelpCircle, CheckCircle2, AlertTriangle, ShieldCheck, Footprints, Ruler, UserCircle2 } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';

interface DeedStatusProps {
    deedType?: string;
    hasSurveyPlan?: boolean;
    hasCleanDeeds?: boolean;
    hazards?: string[];
    accessRoadWidth?: number;
    boundariesMarked?: boolean;
    sellerType?: string;
}

export default function DeedStatus({
    deedType = "other",
    hasSurveyPlan = false,
    hasCleanDeeds = false,
    hazards = [],
    accessRoadWidth = 0,
    boundariesMarked = false,
    sellerType = "owner"
}: DeedStatusProps) {

    // Helper to format deed type
    const formatDeed = (type: string) => {
        if (!type || type === 'other') return 'Not Specified';
        if (type === 'sinnakkara') return 'Sinnakkara (Freehold)';
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    const isClearTitle = deedType.toLowerCase().includes("sinnakkara") || deedType.toLowerCase().includes("freehold");
    const isRisky = hazards.length > 0;

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <h4 className="flex items-center gap-2 font-semibold text-lg text-slate-800 dark:text-slate-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Verified Details
            </h4>

            <div className="space-y-3">

                {/* Deed Type */}
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4" /> Deed Type
                    </span>
                    <Badge variant={isClearTitle ? "default" : "secondary"} className={`${isClearTitle ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}`}>
                        {formatDeed(deedType)}
                    </Badge>
                </div>

                {/* Seller Type */}
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <UserCircle2 className="w-4 h-4" /> Selling As
                    </span>
                    <span className="font-medium text-sm capitalize">{sellerType === 'poa' ? 'Power of Attorney' : sellerType.replace('_', ' ')}</span>
                </div>

                {/* Road Access */}
                {accessRoadWidth > 0 && (
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Footprints className="w-4 h-4" /> Access Road
                        </span>
                        <div className="flex items-center gap-2">
                            <span className={`font-medium text-sm ${accessRoadWidth < 10 ? 'text-amber-600' : 'text-slate-700 dark:text-slate-200'}`}>
                                {accessRoadWidth} Feet
                            </span>
                            {accessRoadWidth < 10 && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger><AlertTriangle className="w-3.5 h-3.5 text-amber-500" /></TooltipTrigger>
                                        <TooltipContent><p>Road width under 10ft may affect bank loan eligibility.</p></TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                    </div>
                )}

                {/* Checklist Badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                    {hasSurveyPlan && (
                        <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-600 gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Survey Plan
                        </Badge>
                    )}
                    {hasCleanDeeds && (
                        <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-600 gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> 30-Year History
                        </Badge>
                    )}
                    {boundariesMarked && (
                        <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-600 gap-1">
                            <Ruler className="w-3 h-3 text-emerald-500" /> Boundaries Marked
                        </Badge>
                    )}
                </div>

                {/* Hazards Warning */}
                {isRisky && (
                    <div className="mt-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-400">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                                <span className="font-semibold block mb-0.5">Disclosed Hazards:</span>
                                {hazards.map(h => h.charAt(0).toUpperCase() + h.slice(1)).join(", ")}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="text-[10px] text-slate-400 mt-2 text-center">
                User declared information. Verify independently.
            </div>
        </div>
    );
}
