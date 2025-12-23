'use client';

import { useState, useEffect, useCallback } from 'react';
import { databases } from '@/lib/appwrite';
import { DB_ID, COLLECTION_LISTINGS } from '@/appwrite/config';
import { Query, ID } from 'appwrite';
import { toast } from 'sonner';
import {
    Download, Printer, QrCode, FileText, Share2,
    Loader2, MapPin, Phone, Home, Copy
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Image from 'next/image';

export function MarketingTools({ userId }) {
    const [listings, setListings] = useState([]);
    const [selectedListing, setSelectedListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const fetchListings = useCallback(async () => {
        try {
            const response = await databases.listDocuments(
                DB_ID,
                COLLECTION_LISTINGS,
                [Query.equal('user_id', userId), Query.orderDesc('$createdAt')]
            );
            setListings(response.documents);
            if (response.documents.length > 0) setSelectedListing(response.documents[0]);
        } catch (error) {
            // console.error('Failed to fetch listings:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) fetchListings();
    }, [userId, fetchListings]);

    const generatePDF = async () => {
        setGenerating(true);
        const input = document.getElementById('flyer-preview');
        try {
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${selectedListing.title.slice(0, 15)}_flyer.pdf`);
            toast.success('Flyer downloaded!');
        } catch (error) {
            // console.error('PDF Generation failed:', error);
            toast.error('Failed to generate PDF');
        } finally {
            setGenerating(false);
        }
    };

    const downloadQR = () => {
        const canvas = document.getElementById('qr-code-canvas');
        if (canvas) {
            const pngUrl = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `${selectedListing.title.slice(0, 15)}_qr.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            toast.success('QR Code downloaded!');
        }
    };

    if (loading) return <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" /></div>;

    if (listings.length === 0) return (
        <div className="text-center py-12">
            <h3 className="text-lg font-bold text-slate-700">No Listings Found</h3>
            <p className="text-slate-500">Create a listing to generate marketing materials.</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Select Property</label>
                        <select
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 truncate"
                            value={selectedListing?.$id}
                            onChange={(e) => setSelectedListing(listings.find(l => l.$id === e.target.value))}
                        >
                            {listings.map(l => (
                                <option key={l.$id} value={l.$id}>{l.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <QrCode className="w-5 h-5 text-emerald-600" /> QR Code
                        </h3>
                        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl mb-4">
                            {selectedListing && (
                                <QRCodeCanvas
                                    id="qr-code-canvas"
                                    value={`https://landsale.lk/properties/${selectedListing.$id}`}
                                    size={160}
                                    level={"H"}
                                    includeMargin={true}
                                />
                            )}
                        </div>
                        <button
                            onClick={downloadQR}
                            className="w-full py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" /> Download PNG
                        </button>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-emerald-600" /> Flyer Actions
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Generate a professional PDF flyer for print or digital sharing.
                        </p>
                        <button
                            onClick={generatePDF}
                            disabled={generating}
                            className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            Download PDF Flyer
                        </button>
                    </div>
                </div>

                {/* Preview Area (Flyer Canvas) */}
                <div className="lg:col-span-2 overflow-auto bg-slate-100 p-8 rounded-2xl flex justify-center">
                    {/* A4 Aspect Ratio scaled down for preview */}
                    {selectedListing && (
                        <div
                            id="flyer-preview"
                            className="bg-white w-[595px] h-[842px] shadow-2xl relative flex flex-col items-center text-center overflow-hidden shrink-0 transform scale-75 origin-top"
                        >
                            {/* Header Image */}
                            <div className="w-full h-[400px] relative">
                                <div className="w-full h-full relative">
                                    {selectedListing.images[0] && typeof selectedListing.images[0] === 'string' && selectedListing.images[0].trim() !== '' ? (
                                        <Image
                                            src={selectedListing.images[0]}
                                            alt="Property"
                                            fill
                                            className="object-cover"
                                            crossOrigin="anonymous"
                                            unoptimized
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.style.display = 'none';
                                                e.target.parentNode.innerHTML += '<div class="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 absolute inset-0">Invalid Image</div>';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 absolute inset-0">No Valid Image</div>
                                    )}
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 text-left">
                                    <h1 className="text-3xl font-bold text-white mb-2">{selectedListing.title}</h1>
                                    <p className="text-xl text-emerald-400 font-bold">LKR {selectedListing.price.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-12 w-full text-left flex-1 flex flex-col">
                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-6 h-6 text-emerald-600 mt-1" />
                                            <div>
                                                <h3 className="font-bold text-slate-800">Location</h3>
                                                <p className="text-slate-600 text-lg">{selectedListing.location || 'Colombo, Sri Lanka'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <Home className="w-6 h-6 text-emerald-600 mt-1" />
                                            <div>
                                                <h3 className="font-bold text-slate-800">Property Type</h3>
                                                <p className="text-slate-600 text-lg capitalize">{selectedListing.listing_type || 'Residential'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                                        <h3 className="font-bold text-slate-800 mb-2">Description</h3>
                                        <p className="text-slate-600 text-sm line-clamp-6 leading-relaxed">
                                            {selectedListing.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-auto border-t-2 border-emerald-500 pt-8 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-slate-200 rounded-full overflow-hidden">
                                            {/* Agent Avatar Placeholder */}
                                            <div className="w-full h-full bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold">A</div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900">Contact Agent</h3>
                                            <div className="flex items-center gap-2 text-slate-600 mt-1">
                                                <Phone className="w-4 h-4" /> <span>+94 77 123 4567</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <QRCodeCanvas
                                            value={`https://landsale.lk/properties/${selectedListing.$id}`}
                                            size={80}
                                        />
                                        <p className="text-xs text-slate-400 mt-2 font-mono">Scan for details</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="w-full bg-slate-900 text-white py-4 text-sm font-medium">
                                www.landsale.lk • The Intelligent Real Estate Ecosystem
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
