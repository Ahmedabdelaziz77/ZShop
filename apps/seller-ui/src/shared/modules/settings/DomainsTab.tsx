"use client";

import { useState } from "react";
import { Globe, Link2, Copy, CheckCircle2, Info } from "lucide-react";

export default function DomainsTab() {
  const [domain, setDomain] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1200);
    } catch {
      /* noop */
    }
  };

  const CNAME_TARGET = "seller.shopname.com";
  const A_RECORD_IP = "YOUR_SERVER_IP";

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-lg p-6 text-gray-300 max-w-3xl shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Globe className="text-green-400" size={18} />
        <h3 className="text-white text-lg font-semibold">Custom Domains</h3>
      </div>

      {/* Add Domain */}
      <section className="border border-gray-800 rounded-lg p-5 mb-6 bg-gray-900/60">
        <div className="flex items-center gap-2 mb-1">
          <Link2 className="text-blue-300" size={16} />
          <p className="text-white font-medium">Add Custom Domain</p>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Connect your own domain to this store.
        </p>

        <label className="block text-sm text-gray-300 mb-2">Domain Name</label>
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="yourdomain.com"
          className="w-full bg-gray-900 border border-gray-800 rounded-md px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600/70 text-white cursor-not-allowed"
            title="Coming soon"
          >
            Save Domain
          </button>
          <span className="text-xs text-blue-300 bg-blue-900/30 border border-blue-800 rounded px-2 py-1">
            Coming soon — will be enabled after deployment
          </span>
        </div>
      </section>

      {/* Connected Domain */}
      <section className="border border-gray-800 rounded-lg p-5 mb-6 bg-gray-900/60">
        <p className="text-white font-medium mb-1">Connected Domain</p>
        <p className="text-sm text-gray-400 mb-3">Manage your custom domain.</p>

        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <span className="inline-flex w-2 h-2 rounded-full bg-gray-600" />
          <span>No domain connected yet.</span>
        </div>
      </section>

      {/* DNS Configuration */}
      <section className="border border-gray-800 rounded-lg p-5 bg-gray-900/60">
        <div className="flex items-center gap-2 mb-1">
          <Info className="text-yellow-300" size={16} />
          <p className="text-white font-medium">DNS Configuration</p>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Set up your DNS records for verification.
        </p>

        <div className="space-y-3">
          <DNSRow
            label="CNAME"
            subtitle='Set host "www" to point to'
            value={CNAME_TARGET}
            onCopy={() => copy("cname", CNAME_TARGET)}
            copied={copiedKey === "cname"}
          />
          <DNSRow
            label="A Record"
            subtitle='Point your root domain "@" to'
            value={A_RECORD_IP}
            onCopy={() => copy("arecord", A_RECORD_IP)}
            copied={copiedKey === "arecord"}
          />
        </div>

        <div className="mt-4 text-xs text-gray-400">
          Tip: After DNS changes, propagation can take up to 24 hours. Once
          deployed, the “Save Domain” button will verify DNS and attach the
          domain to your shop.
        </div>
      </section>

      {/* Inline keyframes */}
      <style jsx>{`
        @keyframes softIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function DNSRow({
  label,
  subtitle,
  value,
  onCopy,
  copied,
}: {
  label: string;
  subtitle: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="rounded-md bg-gray-900 border border-gray-800 p-3 animate-[softIn_.2s_ease]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white font-medium">{label}</p>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-md border border-gray-700 text-gray-200 hover:bg-gray-800"
        >
          {copied ? (
            <>
              <CheckCircle2 size={14} className="text-green-400" />
              Copied
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy
            </>
          )}
        </button>
      </div>
      <div className="mt-2">
        <code className="text-sm text-blue-300">{value}</code>
      </div>
    </div>
  );
}
