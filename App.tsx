import React, { useState } from 'react';
import UserView from './components/UserView';
import AdminView from './components/AdminView';
import { useFaqManager } from './hooks/useFaqManager';

const App: React.FC = () => {
  const [isAdminView, setIsAdminView] = useState(false);
  const { faqs, addFaq, updateFaq, deleteFaq, replaceAllFaqs } = useFaqManager();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
                <svg className="w-8 h-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                <h1 className="text-2xl font-bold text-gray-800">FAQ 페이지</h1>
            </div>
          <div className="flex items-center">
            <span className="mr-3 text-sm font-medium text-gray-600">관리자 모드</span>
            <label htmlFor="view-toggle" className="inline-flex relative items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isAdminView} 
                onChange={() => setIsAdminView(!isAdminView)} 
                id="view-toggle" 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {isAdminView ? (
          <AdminView faqs={faqs} addFaq={addFaq} updateFaq={updateFaq} deleteFaq={deleteFaq} replaceAllFaqs={replaceAllFaqs} />
        ) : (
          <UserView faqs={faqs} />
        )}
      </main>
    </div>
  );
};

export default App;
