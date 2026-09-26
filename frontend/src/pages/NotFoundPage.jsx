import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Leaf } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface-0 border border-line-200 rounded-hero p-8 text-center shadow-ambient">
        <div className="w-16 h-16 rounded-2xl bg-sage-100 text-forest-700 flex items-center justify-center mx-auto mb-4 font-display font-bold text-2xl">
          404
        </div>
        <h1 className="font-display font-bold text-2xl text-forest-900 mb-2">
          Page Not Found
        </h1>
        <p className="text-xs text-ink-500 mb-6">
          The agricultural directory or trade order you requested does not exist or has been relocated.
        </p>
        <Link to="/">
          <Button variant="solid-forest" size="md" icon={Home}>
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
