import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { BasicDemo } from './pages/BasicDemo';
import { EcommerceDemo } from './pages/EcommerceDemo';
import { SupportDemo } from './pages/SupportDemo';
import { AllFeaturesDemo } from './pages/AllFeaturesDemo';
import { SignIn } from './components/auth/SignIn';
import { SignUp } from './components/auth/SignUp';
import { Dashboard } from './pages/Dashboard';
import { ChatbotPlayground } from './pages/ChatbotPlayground';
import { UserProfile } from './pages/UserProfile';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

const Home = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl w-full">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Welcome to <span className="text-indigo-600">LOACL</span>
        </h1>
        <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
          A Lightweight OpenAI Assistants Chatbot Library that simplifies the integration of OpenAI's powerful AI assistants into your applications.
        </p>
        <div className="text-sm text-gray-500 mb-8">
          * This is an open-source project and is not affiliated with, endorsed by, or connected to OpenAI.
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Effortless AI Integration
            </h2>
            <div className="space-y-6 text-gray-600">
              <p>
                LOACL makes it incredibly easy to create and deploy AI-powered chatbots. Design your OpenAI assistants in our intuitive playground, then seamlessly embed them anywhere in your application.
              </p>
              <p>
                With our flexible and easy-to-use embeddable chatbot component, you can:
              </p>
              <ul className="list-disc pl-6 space-y-3">
                <li>Customize the appearance to match your brand</li>
                <li>Configure features and functionality</li>
                <li>Deploy across multiple platforms</li>
                <li>Manage conversations and context effortlessly</li>
              </ul>
            </div>

            <div className="mt-12 space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900">
                Explore Our Repositories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a
                  href="https://github.com/alinaqi/loacl_backend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Backend Repository
                    </h4>
                    <p className="text-gray-600">
                      FastAPI-based backend service with OpenAI integration
                    </p>
                  </div>
                  <svg className="h-6 w-6 ml-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a
                  href="https://github.com/alinaqi/loacl_frontend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Frontend Repository
                    </h4>
                    <p className="text-gray-600">
                      React-based UI components and demo implementations
                    </p>
                  </div>
                  <svg className="h-6 w-6 ml-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navigation />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/basic" element={<BasicDemo />} />
              <Route path="/ecommerce" element={<EcommerceDemo />} />
              <Route path="/support" element={<SupportDemo />} />
              <Route path="/features" element={<AllFeaturesDemo />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chatbot-playground"
                element={
                  <ProtectedRoute>
                    <ChatbotPlayground />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
