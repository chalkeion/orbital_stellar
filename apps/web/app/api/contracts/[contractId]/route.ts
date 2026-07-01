import { NextResponse } from 'next/server';
import { StellarSdk } from 'stellar-sdk';

// RPC endpoint (public testnet)
const RPC_URL = 'https://soroban-testnet.stellar.org';
const server = new StellarSdk.Server(RPC_URL);

export async function GET(request: Request, { params }: { params: { contractId: string } }) {
  const url = new URL(request.url);
  const topic = url.searchParams.get('topic') || undefined;
  const cursor = url.searchParams.get('cursor') || '0';

  const rpcPayload = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'getEvents',
    params: {
      startLedger: cursor,
      filters: [{ contractIds: [params.contractId], topics: topic ? [topic] : [] }],
    },
  };

  const resp = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rpcPayload),
  });
  const json = await resp.json();

  const events = json.result?.events?.map((e: any) => ({
    contractId: e.contractId,
    ledger: e.ledger,
    topic: e.topic,
    rawPayload: e.value,
  })) || [];

  const lastLedger = events.length ? events[events.length - 1].ledger : cursor;

  return NextResponse.json({ events, lastLedger });
}
