import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { StellarSdk, scValToNative } from 'stellar-sdk'; // Ensure stellar-sdk is installed

// Default testnet USDC contract (adjustable via query param)
const DEFAULT_CONTRACT = 'CA5YGPIW5K4U5OF5VJ4UJZJWSHN63D4KUBZLMT4SQN4NQEQG25CTWRFU';

export default function ContractEventsPlayground() {
  const [contractId, setContractId] = useState<string>(DEFAULT_CONTRACT);
  const [topic, setTopic] = useState<string>('');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const lastLedger = useRef<string>('0');

  // Pull query params for pre‑populate support
  const searchParams = useSearchParams();
  useEffect(() => {
    const cid = searchParams.get('contract') || DEFAULT_CONTRACT;
    const t = searchParams.get('topic') || '';
    setContractId(cid);
    setTopic(t);
  }, [searchParams]);

  // Poll the backend for new events
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const resp = await fetch(
          `/api/contracts/${contractId}?topic=${encodeURIComponent(topic)}&cursor=${lastLedger.current}`
        );
        if (!resp.ok) throw new Error('Failed to fetch events');
        const json = await resp.json();
        const newEvents = json.events?.map((e: any) => {
          const decoded = e.value ? scValToNative(StellarSdk.xdr.ScVal.fromXDR(e.value, 'base64')) : null;
          return {
            contractId: e.contractId,
            ledger: e.ledger,
            topic: e.topic,
            rawPayload: e.value,
            decodedPayload: decoded,
          };
        }) || [];
        if (newEvents.length) {
          setEvents(prev => [...prev, ...newEvents]);
          // RPC returns the ledger of the last event
          lastLedger.current = json.lastLedger || lastLedger.current;
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        timer = setTimeout(fetchEvents, 5000); // 5‑second interval
      }
    };
    fetchEvents();
    return () => clearTimeout(timer);
  }, [contractId, topic]);

  return (
    <section className="p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Soroban Contract Events Playground</h1>
      <div className="grid grid-cols-1 gap-4 mb-6">
        <input
          type="text"
          placeholder="Contract ID"
          value={contractId}
          onChange={e => setContractId(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Topic filter (optional)"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          className="p-2 border rounded"
        />
      </div>
      {loading && <p className="text-gray-600">Fetching latest events…</p>}
      <ul className="mt-4 space-y-2 max-h-96 overflow-y-auto">
        {events.map((ev, idx) => (
          <li key={idx} className="p-2 bg-gray-50 rounded space-y-2">
            <details className="open:ring-2 open:ring-indigo-500 open:ring-offset-2">
              <summary className="cursor-pointer font-medium">Raw Event</summary>
              <pre className="text-sm overflow-x-auto mt-1">{JSON.stringify(ev, null, 2)}</pre>
            </details>
            {ev.decodedPayload && (
              <details className="mt-2 open:ring-2 open:ring-indigo-500 open:ring-offset-2">
                <summary className="cursor-pointer font-medium">Decoded Payload</summary>
                <pre className="text-sm overflow-x-auto mt-1">{JSON.stringify(ev.decodedPayload, null, 2)}</pre>
              </details>
            )}
          </li>
    </section>
  );
}
