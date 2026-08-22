import React, { useState } from 'react';
import { useConsentStore } from '../../stores/consentStore';
import { useIdentityStore } from '../../stores/identityStore';
import FingerprintRoundedIcon from '@mui/icons-material/FingerprintRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import { cn } from '../../utils/cn';

export default function PrivacyPage() {
  const { anonId, passphraseHash, setPassphraseHash } = useIdentityStore();
  const { optedIn, setConsent } = useConsentStore();
  
  const [passphrase, setPassphrase] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSavePassphrase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) return;
    
    // Simple client-side SHA-256 hash using SubtleCrypto
    const encoder = new TextEncoder();
    const data = encoder.encode(passphrase);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    setPassphraseHash(hashHex);
    setPassphrase('');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex-1 flex flex-col p-4 max-w-2xl mx-auto w-full pt-8 pb-20 space-y-12">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-fg-heading mb-4">Privacy & Identity</h1>
        <p className="text-lg text-fg-secondary">
          MindLine is built to protect your identity. You never need to use your name or student number.
        </p>
      </div>

      {/* ID Section */}
      <section className="bg-bg-secondary p-6 rounded-3xl border border-border-subtle shadow-sm">
        <div className="flex items-center mb-4 text-teal-800 dark:text-teal-200">
          <FingerprintRoundedIcon className="mr-3" />
          <h2 className="text-xl font-medium">Your Anonymous ID</h2>
        </div>
        
        <div className="bg-bg-primary rounded-xl p-4 flex items-center justify-between mb-4">
          <span className="font-mono text-lg font-medium tracking-widest text-teal-900 dark:text-mint-100">{anonId || 'Not generated yet'}</span>
        </div>
        
        <p className="text-sm text-fg-secondary">
          This ID is generated randomly on your device. We use it to link your check-ins together and spot trends, without ever knowing who you are.
        </p>
      </section>

      {/* Consent Section */}
      <section className="bg-bg-secondary p-6 rounded-3xl border border-border-subtle shadow-sm">
        <div className="flex items-center mb-4 text-teal-800 dark:text-teal-200">
          <SecurityRoundedIcon className="mr-3" />
          <h2 className="text-xl font-medium">Contact Consent</h2>
        </div>
        
        <p className="text-sm text-fg-secondary mb-6">
          If our system notices things have been consistently difficult for you, the MUST Counselling Unit can reach out—but only if you allow it. You can change this setting at any time.
        </p>

        <label className="flex items-center justify-between p-4 bg-bg-primary rounded-xl border border-border-subtle cursor-pointer focus-within:ring-2 focus-within:ring-border-focus focus-within:ring-offset-2 focus-within:ring-offset-bg-secondary">
          <div>
            <span className="block font-medium">Allow contact if needed</span>
            <span className="text-sm text-fg-secondary">{optedIn ? 'Currently opted in' : 'Currently anonymous'}</span>
          </div>
          <input 
            type="checkbox" 
            className="w-5 h-5 text-mint-600 rounded bg-bg-primary border-border-subtle focus:ring-0 focus:outline-none"
            checked={optedIn}
            onChange={(e) => setConsent(e.target.checked)}
          />
        </label>
      </section>

      {/* Passphrase Section */}
      <section className="bg-bg-secondary p-6 rounded-3xl border border-border-subtle shadow-sm">
        <h2 className="text-xl font-medium mb-2 text-teal-800 dark:text-teal-200">Optional Passphrase</h2>
        <p className="text-sm text-fg-secondary mb-6">
          Until our backend is available, this passphrase only re-confirms your identity on this specific device (e.g. if you clear your browser data). True cross-device continuity will be added later.
        </p>
        
        <form onSubmit={handleSavePassphrase} className="space-y-4">
          <div>
            <label htmlFor="passphrase" className="sr-only">Passphrase</label>
            <input
              id="passphrase"
              type="password"
              placeholder="Enter a memorable phrase..."
              className="w-full bg-bg-primary border border-border-subtle rounded-xl p-4 text-fg-primary focus:outline-none focus:ring-2 focus:ring-border-focus"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={!passphrase.trim()}
            className={cn(
              "w-full py-3 px-6 rounded-xl font-medium transition-colors focus-ring",
              !passphrase.trim() ? "bg-bg-primary text-fg-secondary cursor-not-allowed" : "bg-teal-700 hover:bg-teal-800 text-white"
            )}
          >
            {isSaved ? 'Saved!' : passphraseHash ? 'Update Passphrase' : 'Save Passphrase'}
          </button>
        </form>
      </section>
      
    </div>
  );
}
