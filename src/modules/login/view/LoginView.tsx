import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Lock, User as UserIcon, Loader2, ArrowLeft } from "lucide-react";

interface LoginViewProps {
  onSuccess: () => void;
  onBackToPublic: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess, onBackToPublic }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await login(username, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transition-all hover:shadow-2xl">
        <div className="text-center">
          {/* Saffron / Red Temple Emblem Style */}
          <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center text-white font-display text-2xl font-bold shadow-md border-2 border-amber-400 animate-pulse">
            ॐ
          </div>
          <h2 className="mt-6 text-3xl font-bold font-display text-gray-900 tracking-tight">
            Mandir Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Shree Bhairavnath Mandir Trust
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 text-sm"
                  placeholder="Enter admin username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:z-10 text-sm"
                  placeholder="Enter password"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out shadow-md disabled:bg-red-400 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : null}
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            <button
              type="button"
              onClick={onBackToPublic}
              className="flex items-center justify-center text-sm font-medium text-gray-500 hover:text-red-600 transition py-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Public Website
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default LoginView;
