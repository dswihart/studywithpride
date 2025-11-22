'use client';

import { useChat } from 'ai/react';
import { useRef, useEffect } from 'react';

export default function ChatInterface() {
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-lg">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        <p className="text-lg font-semibold">Hola! 👋</p>
                        <p>I'm your Visa Assistant. Ask me anything about studying in Spain!</p>
                    </div>
                )}
                {messages.map(m => (
                    <div
                        key={m.id}
                        className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-3 ${m.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{m.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                            <span className="animate-pulse">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <div className="flex gap-2">
                    <input
                        className="flex-1 p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask about visa requirements..."
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}
