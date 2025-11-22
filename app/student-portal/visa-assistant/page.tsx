import ChatInterface from '@/components/visa-assistant/ChatInterface';

export default function VisaAssistantPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">AI Visa Assistant</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Get instant answers to your questions about student visas, documentation, and procedures for Spain.
                </p>
                <ChatInterface />
            </div>
        </div>
    );
}
