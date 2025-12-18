'use client';

import { useState, useEffect } from 'react';
import { databases } from '@/lib/appwrite';
import { DB_ID, COLLECTION_LISTINGS } from '@/lib/constants';
import { Query, ID } from 'appwrite';
import { toast } from 'sonner';
import {
    Calendar, Clock, MapPin, Users, Plus, Trash2, Eye, Loader2
} from 'lucide-react';

const COLLECTION_OPEN_HOUSES = 'open_houses'; // Assumed collection

export function OpenHouseScheduler({ userId }) {
    const [listings, setListings] = useState([]);
    const [openHouses, setOpenHouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [newEvent, setNewEvent] = useState({
        listing_id: '',
        date: '',
        start_time: '',
        end_time: '',
        notes: ''
    });

    useEffect(() => {
        if (userId) fetchData();
    }, [userId]);

    const fetchData = async () => {
        try {
            const [listingsRes, openHousesRes] = await Promise.all([
                databases.listDocuments(
                    DB_ID,
                    COLLECTION_LISTINGS,
                    [Query.equal('user_id', userId), Query.orderDesc('$createdAt')]
                ),
                // Try fetching open houses, handle error if collection doesn't exist
                databases.listDocuments(
                    DB_ID,
                    COLLECTION_OPEN_HOUSES,
                    [Query.equal('agent_id', userId), Query.orderDesc('date')]
                ).catch(() => ({ documents: [] }))
            ]);

            setListings(listingsRes.documents);
            setOpenHouses(openHousesRes.documents);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newEvent,
                agent_id: userId,
                created_at: new Date().toISOString()
            };

            const response = await databases.createDocument(
                DB_ID,
                COLLECTION_OPEN_HOUSES,
                ID.unique(),
                payload
            );

            setOpenHouses([response, ...openHouses]);
            setIsModalOpen(false);
            setNewEvent({ listing_id: '', date: '', start_time: '', end_time: '', notes: '' });
            toast.success('Open House scheduled!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to schedule event');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Cancel this open house?')) return;
        try {
            await databases.deleteDocument(DB_ID, COLLECTION_OPEN_HOUSES, id);
            setOpenHouses(prev => prev.filter(oh => oh.$id !== id));
            toast.success('Event cancelled');
        } catch (error) {
            toast.error('Failed to cancel event');
        }
    };

    if (loading) return <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" /></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Upcoming Open Houses</h2>
                    <p className="text-slate-500 text-sm">Schedule and manage your property viewings</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-200"
                >
                    <Plus className="w-5 h-5" /> Schedule New
                </button>
            </div>

            {openHouses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {openHouses.map(event => {
                        const listing = listings.find(l => l.$id === event.listing_id);
                        return (
                            <div key={event.$id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </div>
                                        <button
                                            onClick={() => handleDelete(event.$id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <h3 className="font-bold text-slate-800 mb-1 truncate">{listing ? listing.title : 'Unknown Property'}</h3>
                                    <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {listing ? listing.location : '-'}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-emerald-600" />
                                            <span className="font-medium">{event.start_time} - {event.end_time}</span>
                                        </div>
                                        {event.visitor_count !== undefined && (
                                            <div className="flex items-center gap-1 text-xs font-bold bg-white px-2 py-1 rounded-md shadow-sm">
                                                <Users className="w-3 h-3 text-blue-500" /> {event.visitor_count}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
                                    <span className="text-slate-500">{event.notes || 'No notes'}</span>
                                    <span className="text-emerald-600 font-bold group-hover:underline cursor-pointer">View Details</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="font-bold text-slate-700 mb-2">No Scheduled Events</h3>
                    <p className="text-slate-500 mb-4">Plan your first open house to attract buyers.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-emerald-600 font-bold hover:underline"
                    >
                        Schedule Now
                    </button>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-scale-up">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Schedule Open House</h3>
                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Select Property</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                                    value={newEvent.listing_id}
                                    onChange={(e) => setNewEvent({ ...newEvent, listing_id: e.target.value })}
                                >
                                    <option value="">Select a listing...</option>
                                    {listings.map(l => (
                                        <option key={l.$id} value={l.$id}>{l.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                                    value={newEvent.date}
                                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                                        value={newEvent.start_time}
                                        onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">End Time</label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                                        value={newEvent.end_time}
                                        onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Notes (Optional)</label>
                                <textarea
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 resize-none h-24"
                                    placeholder="Gate code, refreshments provided, etc."
                                    value={newEvent.notes}
                                    onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
                                >
                                    Schedule Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
