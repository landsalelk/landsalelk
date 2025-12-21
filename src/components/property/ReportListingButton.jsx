'use client';

import { useState } from 'react';
import { Flag, X, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { databases, account } from '@/appwrite';
import { DB_ID } from '@/appwrite/config';
import { ID } from 'appwrite';
import { toast } from 'sonner';

const REPORT_REASONS = [
    { id: 'inaccurate', label: 'Inaccurate Information', description: 'Details don\'t match the property' },
    { id: 'scam', label: 'Potential Scam', description: 'Suspicious pricing or requests' },
    { id: 'duplicate', label: 'Duplicate Listing', description: 'This property is listed multiple times' },
    { id: 'sold', label: 'Already Sold/Rented', description: 'Property is no longer available' },
    { id: 'inappropriate', label: 'Inappropriate Content', description: 'Offensive images or language' },
    { id: 'other', label: 'Other', description: 'Something else is wrong' }
];

// Note: Requires 'listing_reports' collection in Appwrite with:
// - listing_id (string)
// - user_id (string)
// - reason (string)
// - details (string)
// - status (string: pending/reviewed/resolved)
// - created_at (datetime)

export function ReportListingButton({ listingId, listingTitle }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState(null);
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedReason) {
            toast.error('Please select a reason');
            return;
        }

        setIsSubmitting(true);
        try {
            const user = await account.get();

            // For now, we'll log the report. In production, create a document in 'listing_reports' collection
            console.log('Report submitted:', {
                listing_id: listingId,
                user_id: user.$id,
                reason: selectedReason,
                details: details,
                status: 'pending',
                created_at: new Date().toISOString()
            });

            // Uncomment when collection is ready:
            // await databases.createDocument(
            //     DB_ID,
            //     'listing_reports',
            //     ID.unique(),
            //     {
            //         listing_id: listingId,
            //         user_id: user.$id,
            //         reason: selectedReason,
            //         details: details,
            //         status: 'pending',
            //         created_at: new Date().toISOString()
            //     }
            // );

            setIsSubmitted(true);
            toast.success('Report submitted successfully');
        } catch (error) {
            console.error('Error submitting report:', error);
            toast.error('Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setSelectedReason(null);
        setDetails('');
        setIsSubmitted(false);
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
            >
                <Flag className="w-4 h-4" />
                Report Listing
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-6 relative shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>

                        {isSubmitted ? (
                            /* Success State */
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Report Submitted</h3>
                                <p className="text-slate-500 mb-6">
                                    Thank you for helping keep our platform safe. We'll review your report within 24-48 hours.
                                </p>
                                <button
                                    onClick={handleClose}
                                    className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            /* Form State */
                            <>
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertTriangle className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900">Report This Listing</h3>
                                    <p className="text-slate-500 text-sm mt-1 truncate max-w-xs mx-auto">
                                        {listingTitle}
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Reason Selection */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-3">
                                            Why are you reporting this listing?
                                        </label>
                                        <div className="space-y-2">
                                            {REPORT_REASONS.map(reason => (
                                                <label
                                                    key={reason.id}
                                                    className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all ${selectedReason === reason.id
                                                            ? 'border-red-500 bg-red-50'
                                                            : 'border-slate-100 hover:border-slate-200 bg-slate-50'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="reason"
                                                        value={reason.id}
                                                        checked={selectedReason === reason.id}
                                                        onChange={() => setSelectedReason(reason.id)}
                                                        className="mt-1 accent-red-500"
                                                    />
                                                    <div>
                                                        <div className="font-bold text-slate-900">{reason.label}</div>
                                                        <div className="text-sm text-slate-500">{reason.description}</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Additional Details */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Additional Details (Optional)
                                        </label>
                                        <textarea
                                            value={details}
                                            onChange={(e) => setDetails(e.target.value)}
                                            placeholder="Provide any additional information that might help us investigate..."
                                            className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:bg-white outline-none resize-none h-24"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !selectedReason}
                                        className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Flag className="w-5 h-5" />
                                                Submit Report
                                            </>
                                        )}
                                    </button>

                                    <p className="text-xs text-slate-400 text-center">
                                        False reports may result in account restrictions. Please only report genuine issues.
                                    </p>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
