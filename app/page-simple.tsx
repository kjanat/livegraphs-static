/**
 * Simplified page for testing build issues
 */

"use client";

export default function SimpleHome() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900">Simple Test Page</h1>
        <p>
          This is a simple page to test if the build works without database or chart components.
        </p>
      </div>
    </main>
  );
}
