
export default function DebugPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "MISSING";

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Nivara Debug</h1>
      <p>Supabase URL:</p>
      <pre>{url}</pre>
    </main>
  );
}
