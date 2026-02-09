
import React, { useState, useCallback, useRef } from 'react';
import { Button } from './components/Button';
import { ImageComparison } from './components/ImageComparison';
import { editImage } from './services/geminiService';
import { ImageHistoryItem, ProcessingState, QuickAction } from './types';

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<ImageHistoryItem[]>([]);
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    status: '',
    error: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const result = readerEvent.target?.result as string;
        setOriginalImage(result);
        setEditedImage(null);
        setPrompt('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async (manualPrompt?: string) => {
    const activePrompt = manualPrompt || prompt;
    if (!originalImage || !activePrompt.trim()) return;

    setProcessing({ isProcessing: true, status: 'Applying AI magic...', error: null });
    
    try {
      const resultUrl = await editImage(originalImage, activePrompt);
      setEditedImage(resultUrl);
      
      const newItem: ImageHistoryItem = {
        id: Date.now().toString(),
        originalUrl: originalImage,
        editedUrl: resultUrl,
        prompt: activePrompt,
        timestamp: Date.now()
      };
      
      setHistory(prev => [newItem, ...prev].slice(0, 10));
      setProcessing({ isProcessing: false, status: '', error: null });
    } catch (err: any) {
      setProcessing({ 
        isProcessing: false, 
        status: '', 
        error: err.message || 'Failed to process image. Please try again.' 
      });
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setEditedImage(null);
    setPrompt('');
    setProcessing({ isProcessing: false, status: '', error: null });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold italic">P</div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              ProductClean AI
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded uppercase tracking-wider">
              Powered by Gemini 2.5 Flash
            </span>
            {originalImage && (
              <Button variant="ghost" onClick={reset}>
                Clear All
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
        {!originalImage ? (
          <div className="h-[60vh] flex flex-col items-center justify-center">
            <div 
              className="w-full max-w-2xl border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center bg-white hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload your product photo</h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                Select a RAW or unedited photo. Our AI will handle the rest based on your instructions.
              </p>
              <Button variant="primary" className="mx-auto px-8 py-3 rounded-full text-lg shadow-xl shadow-indigo-200">
                Choose Image
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {editedImage ? (
                <div className="space-y-4">
                  <ImageComparison beforeUrl={originalImage} afterUrl={editedImage} />
                  <div className="flex gap-4">
                    <Button 
                      variant="secondary" 
                      className="flex-1"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = editedImage;
                        link.download = 'edited-product.png';
                        link.click();
                      }}
                    >
                      Download Clean Photo
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => setEditedImage(null)}>
                      Edit Again
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative group bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                   <img src={originalImage} alt="Original" className="w-full max-h-[600px] object-contain rounded-xl" />
                   {processing.isProcessing && (
                     <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-40 transition-all">
                        <div className="relative w-24 h-24 mb-6">
                           <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                           <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-xl font-semibold text-indigo-900 animate-pulse">{processing.status}</p>
                        <p className="text-gray-500 mt-2">This usually takes about 10-15 seconds</p>
                     </div>
                   )}
                </div>
              )}

              {/* Instructions Panel */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-semibold text-gray-900">Editing Instructions</h3>
                </div>
                <div className="p-6 space-y-4">
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. 'Remove the background and add soft studio shadows', 'Place on a marble countertop', 'Enhance lighting'..."
                    className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-800 text-lg outline-none transition-all"
                    disabled={processing.isProcessing}
                  />
                  
                  <div className="flex flex-wrap gap-2">
                    {Object.values(QuickAction).map((action) => (
                      <button
                        key={action}
                        onClick={() => handleProcess(action)}
                        disabled={processing.isProcessing}
                        className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50"
                      >
                        {action.split(' ').slice(0, 2).join(' ')}...
                      </button>
                    ))}
                  </div>

                  {processing.error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-3">
                      <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {processing.error}
                    </div>
                  )}

                  <Button 
                    className="w-full py-4 text-lg shadow-lg shadow-indigo-100"
                    onClick={() => handleProcess()}
                    isLoading={processing.isProcessing}
                  >
                    Generate Enhanced Photo
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar: History & Quick Tips */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl text-white shadow-xl shadow-indigo-200">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                  Pro Tips
                </h4>
                <ul className="text-indigo-100 text-sm space-y-3">
                  <li className="flex gap-2">
                    <span className="text-indigo-300 font-bold">•</span>
                    Be specific about background colors or textures.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-300 font-bold">•</span>
                    Ask to "improve resolution" or "clean dust" for crisper shots.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-300 font-bold">•</span>
                    Try "Studio shot with dramatic side lighting" for premium vibes.
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 font-semibold text-gray-900">
                  Recent Edits
                </div>
                <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                  {history.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-sm italic">No history yet</p>
                    </div>
                  ) : (
                    history.map(item => (
                      <div 
                        key={item.id} 
                        className="group relative cursor-pointer rounded-lg overflow-hidden border border-gray-100 hover:border-indigo-300 transition-all shadow-sm"
                        onClick={() => {
                          setOriginalImage(item.originalUrl);
                          setEditedImage(item.editedUrl);
                          setPrompt(item.prompt);
                        }}
                      >
                        <img src={item.editedUrl} className="w-full aspect-square object-cover" alt="History" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                          <p className="text-white text-[10px] line-clamp-2">{item.prompt}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">© 2024 ProductClean AI. All editing powered by Gemini Multi-modal models.</p>
        </div>
      </footer>
    </div>
  );
}
