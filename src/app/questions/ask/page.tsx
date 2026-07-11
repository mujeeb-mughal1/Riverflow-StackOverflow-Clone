import React from "react";
import QuestionForm from "@/components/QuestionForm";

export default function AskQuestionPage() {
    return (
        <div className="container mx-auto px-4 pb-20 pt-36">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-black dark:text-white">Ask a public question</h1>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    Be specific and imagine you’re asking a question to another person.
                </p>
            </div>
            
            <div className="mx-auto w-full max-w-4xl rounded-xl border border-white/20 bg-white p-6 shadow-input dark:bg-black">
                <QuestionForm />
            </div>
        </div>
    );
}