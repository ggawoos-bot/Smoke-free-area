
import React, { useState, useMemo } from 'react';
import type { FAQItem } from '../types';
import { ChevronDownIcon, SearchIcon } from './icons';

interface UserViewProps {
  faqs: FAQItem[];
}

const FaqAccordionItem: React.FC<{ faq: FAQItem; isOpen: boolean; onClick: () => void }> = ({ faq, isOpen, onClick }) => {
  return (
    <div className="border-b border-gray-200">
      <h2>
        <button
          type="button"
          className="flex justify-between items-center w-full p-6 text-left font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
          onClick={onClick}
          aria-expanded={isOpen}
        >
          <span>{faq.question}</span>
          <ChevronDownIcon className={`w-5 h-5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </h2>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-6 pt-0 text-gray-600">
            <p className="whitespace-pre-wrap">{faq.answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};


const UserView: React.FC<UserViewProps> = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggle = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  const filteredFaqs = useMemo(() => {
    if (!searchTerm) {
      return faqs;
    }
    return faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [faqs, searchTerm]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4">
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </span>
          <input
            type="search"
            placeholder="궁금한 내용을 검색해보세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 pl-11 pr-4 text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            aria-label="FAQ 검색"
          />
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => (
            <FaqAccordionItem
              key={faq.id}
              faq={faq}
              isOpen={openIndex === faq.id}
              onClick={() => handleToggle(faq.id)}
            />
          ))
        ) : (
          <p className="p-6 text-center text-gray-500">
            {searchTerm ? '검색 결과가 없습니다.' : '표시할 FAQ가 없습니다.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserView;