import { supabase } from '../../lib/supabaseClient'

export const OAuthButtons = () => {
  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
    if (error) alert(error.message)
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => handleOAuthLogin('google')}
        className="w-full bg-red-500 text-white px-4 py-2 rounded"
      >
        Continue with Google
      </button>
      <button
        onClick={() => handleOAuthLogin('github')}
        className="w-full bg-gray-800 text-white px-4 py-2 rounded"
      >
        Continue with GitHub
      </button>
    </div>
  )
}
