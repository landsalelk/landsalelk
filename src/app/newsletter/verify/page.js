'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { verifySubscription } from '@/app/actions/verify-newsletter';
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your subscription...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    verifySubscription(token)
      .then((result) => {
        if (result.success) {
          setStatus('success');
          setMessage('Your email has been successfully verified! You are now subscribed.');
        } else {
          setStatus('error');
          setMessage(result.error || 'Verification failed. The link may be expired or invalid.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
        {status === 'verifying' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-[#10b981] animate-spin mb-4" />
            <h2 className="text-xl font-bold text-slate-800">Verifying...</h2>
            <p className="text-slate-500 mt-2">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Verified!</h2>
            <p className="text-slate-600 mb-8">{message}</p>
            <Link
              href="/"
              className="px-8 py-3 bg-[#10b981] text-white rounded-xl font-bold hover:bg-[#059669] transition-colors"
            >
              Back to Home
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center animate-fade-in">
             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Verification Failed</h2>
            <p className="text-slate-600 mb-8">{message}</p>
            <Link
              href="/"
              className="text-slate-500 font-medium hover:text-slate-800 hover:underline"
            >
              Go Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#10b981]" /></div>}>
      <VerifyContent />
    </Suspense>
  );
}
