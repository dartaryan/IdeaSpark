import { useEffect, useState } from 'react';
import { ThemeTest } from './components/ThemeTest';
import { supabase } from './lib/supabase';

type ConnectionStatus = 'checking' | 'connected' | 'error';

function App() {
  const [showThemeTest, setShowThemeTest] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    async function checkConnection() {
      try {
        // Check connection by verifying we can reach Supabase auth service
        // This doesn't require authentication and is a reliable health check
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          // PGRST301 = PostgREST error (usually means service is down or unreachable)
          // PGRST116 = relation does not exist (table not created yet)
          // 42P01 = undefined_table (PostgreSQL error for missing table)
          // 42501 = insufficient_privilege (RLS blocking - but connection works)
          if (
            error.code === 'PGRST116' ||
            error.code === '42P01' ||
            error.code === '42501'
          ) {
            // Connection works but table doesn't exist yet or RLS is blocking - that's expected
            setConnectionStatus('connected');
          } else {
            throw error;
          }
        } else {
          setConnectionStatus('connected');
        }
      } catch (error) {
        setConnectionStatus('error');
        const message = error instanceof Error ? error.message : 'Unknown error';
        setErrorMessage(message);
        console.error('❌ Supabase connection error:', error);
      }
    }

    checkConnection();
  }, []);

  if (showThemeTest) {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50">
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setShowThemeTest(false)}
          >
            Hide Theme Test
          </button>
        </div>
        <ThemeTest />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-8">
      <div className="card bg-base-100 shadow-xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-6 text-primary">
          IdeaSpark
        </h1>
        <p className="text-center text-base-content/70 mb-6">
          Transform employee ideas into reality
        </p>

        {/* Supabase Connection Status */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Supabase Connection</h2>
          <div
            className={`badge gap-2 p-4 ${
              connectionStatus === 'connected'
                ? 'badge-success'
                : connectionStatus === 'error'
                  ? 'badge-error'
                  : 'badge-warning'
            }`}
          >
            {connectionStatus === 'checking' && (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Checking connection...
              </>
            )}
            {connectionStatus === 'connected' && '✅ Connected to Supabase'}
            {connectionStatus === 'error' && '❌ Connection failed'}
          </div>
          {connectionStatus === 'error' && errorMessage && (
            <p className="text-error text-sm mt-2">{errorMessage}</p>
          )}
        </div>

        {/* Theme Test Toggle */}
        <button
          className="btn btn-primary mb-4"
          onClick={() => setShowThemeTest(true)}
        >
          Show Theme Test
        </button>

        <div className="divider my-6">Ready for Development</div>

        <p className="text-sm text-center text-base-content/50">
          PassportCard theme configured ✅
        </p>
      </div>
    </div>
  );
}

export default App;
