import { CheckCircleIcon, CalendarIcon, BellIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-6 py-20 md:py-28 flex flex-col items-center text-center">
        {/* Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
          <span className="text-teal-600">Serverless</span> Task Manager
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mb-12 leading-relaxed font-light">
          Stay organized without the overhead. A clean, scalable task manager built entirely serverless with Next.js, AWS Lambda, API Gateway, DynamoDB, and Cognito.
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14 max-w-5xl w-full">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="mx-auto mb-5 w-14 h-14 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Simple & Secure</h3>
            <p className="text-gray-600">
              AWS Cognito handles authentication. RESTful API keeps everything clean and predictable.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="mx-auto mb-5 w-14 h-14 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <CalendarIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Fully Serverless</h3>
            <p className="text-gray-600">
              Auto-scaling with Lambda, API Gateway & DynamoDB. No servers to manage — ever.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="mx-auto mb-5 w-14 h-14 flex items-center justify-center rounded-full bg-teal-100 text-teal-600">
              <BellIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Smart Reminders</h3>
            <p className="text-gray-600">
              Optional email or SMS notifications via AWS SES/SNS — stay on top without effort.
            </p>
          </div>
        </div>

        {/* Call-to-action buttons */}
        <div className="flex flex-col sm:flex-row gap-5">
          <a
            href="#get-started" // replace with your demo or tasks page link
            className="px-9 py-5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-lg rounded-xl transition-all shadow-md shadow-teal-200/50"
          >
            Try Live Demo
          </a>
          <a
            href="https://github.com/BenGJ10/ToDo-Lambda-Serverless"
            target="_blank"
            rel="noopener noreferrer"
            className="px-9 py-5 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-800 font-medium text-lg rounded-xl transition-all"
          >
            View on GitHub
          </a>
        </div>

        {/* Small footer hint */}
        <p className="mt-16 text-sm text-gray-500">
          Next.js · TypeScript · AWS Lambda · API Gateway · DynamoDB · Cognito · CloudFront
        </p>
      </div>
    </main>
  );
}