// ============================================
// src/pages/index.tsx (or app/page.tsx for Next.js 13+)
// ============================================
import Link from 'next/link';
import { Clock, ArrowRight, Users, Zap, Shield, TrendingUp, Star, CheckCircle, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full backdrop-blur-xl bg-white/80 border-b border-gray-200 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Clock className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  TimeSwap
                </h1>
                <p className="text-xs text-gray-600 font-medium">Exchange Time, Build Community</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center gap-2 group"
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            {/* Hero Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full border border-blue-200 shadow-lg">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                The Future of Service Exchange
              </span>
            </div>

            {/* Hero Title */}
            <div className="space-y-6">
              <h1 className="text-6xl md:text-7xl font-black leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Trade Skills,
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Not Currency
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-medium leading-relaxed">
                Join a revolutionary time-banking marketplace where your skills become your currency. 
                Everyone's time is valued equally.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/register"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-blue-500/40 hover:shadow-3xl hover:shadow-blue-500/50 transition-all duration-300 hover:-translate-y-1 flex items-center gap-3"
              >
                <span>Start Trading Time</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-4 bg-white border-2 border-gray-300 hover:border-blue-600 text-gray-900 font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                Sign In
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">1,200+ Active Members</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">5,600+ Hours Traded</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-semibold text-gray-700">4.8 Average Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Why Choose TimeSwap?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A better way to exchange services and build meaningful connections
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Equal Time Value</h3>
                <p className="text-gray-600 leading-relaxed">
                  Everyone's hour is worth the same. Whether you're teaching or learning, your time matters equally.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-purple-300 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-purple-500/30 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Build Community</h3>
                <p className="text-gray-600 leading-relaxed">
                  Connect with neighbors, share skills, and create lasting relationships through mutual exchange.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-emerald-300 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-teal-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Instant Transfers</h3>
                <p className="text-gray-600 leading-relaxed">
                  Send and receive time credits instantly. No waiting, no fees, just seamless exchanges.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Secure & Trusted</h3>
                <p className="text-gray-600 leading-relaxed">
                  Advanced security measures and verified profiles ensure safe, reliable exchanges.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-indigo-300 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Track Progress</h3>
                <p className="text-gray-600 leading-relaxed">
                  Monitor your exchanges, view transaction history, and see your community impact grow.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group relative bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-yellow-300 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/5 to-orange-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-yellow-500/30 group-hover:scale-110 transition-transform">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Rate & Review</h3>
                <p className="text-gray-600 leading-relaxed">
                  Build your reputation and help others find quality service providers in the community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-xl">
                  1
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Create Your Profile</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Sign up in seconds and showcase your skills. Tell the community what you can offer and what you need.
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 flex-shrink-0" />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-xl">
                  2
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Find Services</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Browse our marketplace to discover talented members offering services you need.
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 flex-shrink-0" />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8 bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-xl">
                  3
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Exchange Time</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Connect, exchange services, and earn time credits. Your hour for their hour—it's that simple!
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 flex-shrink-0" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-12 md:p-16 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-black text-white">
                Ready to Join the Revolution?
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                Start exchanging time today. No credit card required. Just bring your skills and enthusiasm!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <Link
                  href="/auth/register"
                  className="group px-10 py-5 bg-white text-blue-600 font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 flex items-center gap-3"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/auth/login"
                  className="px-10 py-5 bg-white/10 backdrop-blur border-2 border-white/30 text-white font-bold text-lg rounded-2xl hover:bg-white/20 transition-all duration-300"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200 bg-white/80 backdrop-blur">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-black text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  TimeSwap
                </p>
                <p className="text-xs text-gray-600">Time-Based Exchange Platform</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-600">
                © 2025 TimeSwap. Building stronger communities through time exchange.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
