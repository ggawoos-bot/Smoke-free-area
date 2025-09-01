import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { FAQItem } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, UploadIcon, SearchIcon } from './icons';

interface AdminViewProps {
  faqs: FAQItem[];
  addFaq: (faq: Omit<FAQItem, 'id'>) => void;
  updateFaq: (faq: FAQItem) => void;
  deleteFaq: (id: string) => void;
  replaceAllFaqs: (faqs: Omit<FAQItem, 'id'>[]) => void;
}

const FaqForm: React.FC<{ 
    onSubmit: (faq: Omit<FAQItem, 'id'> | FAQItem) => void; 
    onCancel: () => void;
    initialData?: FAQItem | null;
}> = ({ onSubmit, onCancel, initialData }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
  
    useEffect(() => {
        if (initialData) {
            setQuestion(initialData.question);
            setAnswer(initialData.answer);
        } else {
            setQuestion('');
            setAnswer('');
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || !answer.trim()) {
            alert('질문과 답변을 모두 입력해주세요.');
            return;
        }
        if (initialData) {
            onSubmit({ ...initialData, question, answer });
        } else {
            onSubmit({ question, answer });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-gray-50 border rounded-lg space-y-4">
            <div>
                <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">질문</label>
                <input
                    id="question"
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="질문을 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            <div>
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">답변</label>
                <textarea
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="답변을 입력하세요"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            <div className="flex justify-end space-x-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    취소
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    {initialData ? '업데이트' : '추가'}
                </button>
            </div>
        </form>
    );
};


const AdminView: React.FC<AdminViewProps> = ({ faqs, addFaq, updateFaq, deleteFaq, replaceAllFaqs }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddSubmit = (faq: Omit<FAQItem, 'id'>) => {
        addFaq(faq);
        setIsAdding(false);
    };

    const handleUpdateSubmit = (faq: FAQItem) => {
        updateFaq(faq);
        setEditingFaq(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('이 FAQ를 정말 삭제하시겠습니까?')) {
            deleteFaq(id);
        }
    };

    const parseFaqFile = (content: string): Omit<FAQItem, 'id'>[] => {
        const newFaqs: Omit<FAQItem, 'id'>[] = [];
        const blocks = content.trim().split(/\n\s*\n/);

        for (const block of blocks) {
            const lines = block.trim().split('\n');
            if (lines.length < 2) continue;

            const questionLine = lines[0];
            const answerLines = lines.slice(1);

            const isQuestion = questionLine.trim().toUpperCase().startsWith('Q:');
            const isAnswer = answerLines[0].trim().toUpperCase().startsWith('A:');

            if (isQuestion && isAnswer) {
                const question = questionLine.replace(/^[Qq]:\s*/, '').trim();
                
                const firstAnswerLine = answerLines[0].replace(/^[Aa]:\s*/, '').trim();
                const restOfAnswerLines = answerLines.slice(1);
                const answer = [firstAnswerLine, ...restOfAnswerLines].join('\n').trim();

                if (question && answer) {
                    newFaqs.push({ question, answer });
                }
            }
        }
        
        if (newFaqs.length === 0 && content.trim().length > 0) {
            throw new Error("파일에서 유효한 Q&A 쌍을 찾을 수 없습니다. 각 항목은 'Q: 질문'과 'A: 답변'으로 시작하고 빈 줄로 구분되어야 합니다.");
        }
        return newFaqs;
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!window.confirm(`'${file.name}' 파일의 내용으로 현재 모든 FAQ를 교체하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const newFaqs = parseFaqFile(content);
                replaceAllFaqs(newFaqs);
                alert('FAQ가 파일에서 성공적으로 업데이트되었습니다.');
            } catch (error) {
                const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
                alert(`파일 처리 오류: ${message}`);
            } finally {
                 if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.onerror = () => {
             alert('파일을 읽는 중 오류가 발생했습니다.');
             if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
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
        <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">FAQ 관리</h2>
                {!isAdding && !editingFaq && (
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleUploadClick}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <UploadIcon className="w-5 h-5 mr-2" />
                            파일에서 가져오기
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".txt"
                            className="hidden"
                            aria-hidden="true"
                        />
                        <button
                            onClick={() => setIsAdding(true)}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            새 FAQ 추가
                        </button>
                    </div>
                )}
            </div>

            {(isAdding || editingFaq) && (
                <FaqForm
                    onSubmit={(faq) => editingFaq ? handleUpdateSubmit(faq as FAQItem) : handleAddSubmit(faq as Omit<FAQItem, 'id'>)}
                    onCancel={() => { setIsAdding(false); setEditingFaq(null); }}
                    initialData={editingFaq}
                />
            )}
            
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon className="w-5 h-5 text-gray-400" />
                </span>
                <input
                    type="search"
                    placeholder="FAQ 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    aria-label="FAQ 관리 검색"
                />
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map(faq => (
                            <li key={faq.id} className="p-6 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                                        <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{faq.answer}</p>
                                    </div>
                                    <div className="ml-4 flex-shrink-0 flex items-center space-x-3">
                                        <button onClick={() => setEditingFaq(faq)} className="text-indigo-600 hover:text-indigo-900 focus:outline-none" aria-label={`'${faq.question}' 편집`}>
                                            <PencilIcon />
                                            <span className="sr-only">편집</span>
                                        </button>
                                        <button onClick={() => handleDelete(faq.id)} className="text-red-600 hover:text-red-900 focus:outline-none" aria-label={`'${faq.question}' 삭제`}>
                                            <TrashIcon />
                                            <span className="sr-only">삭제</span>
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="p-6 text-center text-gray-500">
                            {searchTerm ? '검색 결과가 없습니다.' : '등록된 FAQ가 없습니다.'}
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default AdminView;