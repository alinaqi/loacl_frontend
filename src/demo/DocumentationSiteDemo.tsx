import React from 'react';

const DocumentationSiteDemo: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Docs</h2>
        <nav>
          <ul>
            <li className="mb-2"><a href="#" className="hover:underline">Introduction</a></li>
            <li className="mb-2"><a href="#" className="hover:underline">Getting Started</a></li>
            <li className="mb-2"><a href="#" className="hover:underline">Tutorial</a></li>
            <li className="mb-2"><a href="#" className="hover:underline">API Reference</a></li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-gray-100">
        <h1 className="text-3xl font-bold mb-6">Documentation Overview</h1>
        <div className="prose max-w-none">
          <h2>Introduction</h2>
          <p>This demo simulates a documentation site layout with a sidebar for navigation and a main content area.</p>
          <h2>Getting Started</h2>
          <p>Follow the guides to learn how to use this documentation site demo.</p>
          <h2>API Reference</h2>
          <p>Here you can find the API documentation with examples and usage details.</p>
        </div>
      </main>
    </div>
  );
};

export default DocumentationSiteDemo; 