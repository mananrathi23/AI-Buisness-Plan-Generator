import { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { Document, Paragraph, Packer, TextRun } from 'docx';
import { saveAs } from 'file-saver';

function App() {
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [usps, setUsps] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });
  const [darkMode, setDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    console.log('Dark mode state:', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Cleanup to ensure no duplicate classes
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, [darkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      console.log('System theme changed to:', e.matches ? 'dark' : 'light');
      setDarkMode(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:3000/generate-plan', {
        businessName,
        industry,
        targetMarket,
        usps
      });
      console.log('Response:', response);
      setPlan(response.data.plan);
      localStorage.setItem('businessPlan', JSON.stringify({ businessName, industry, targetMarket, usps, plan: response.data.plan }));
      showToast('Plan generated successfully!', 'success');
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSample = () => {
    setBusinessName('Sample Coffee Shop');
    setIndustry('Food and Beverage');
    setTargetMarket('Young adults aged 18-35 in urban areas');
    setUsps('Specialty coffee blends, cozy atmosphere, community events');
    handleGenerate();
  };

  const handleClear = () => {
    setBusinessName('');
    setIndustry('');
    setTargetMarket('');
    setUsps('');
    setPlan('');
    setError('');
    showToast('Form cleared!', 'info');
  };

  const handleLoadSavedPlan = () => {
    const saved = localStorage.getItem('businessPlan');
    if (saved) {
      const { businessName, industry, targetMarket, usps, plan } = JSON.parse(saved);
      setBusinessName(businessName);
      setIndustry(industry);
      setTargetMarket(targetMarket);
      setUsps(usps);
      setPlan(plan);
      showToast('Saved plan loaded!', 'success');
    } else {
      showToast('No saved plan found.', 'info');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(plan);
    showToast('Plan copied to clipboard!', 'success');
  };

  const handleSavePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Business Plan for ${businessName}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Industry: ${industry}`, 20, 30);
    doc.text(`Target Market: ${targetMarket}`, 20, 40);
    doc.text(`USPs: ${usps}`, 20, 50);
    doc.text('Plan:', 20, 60);
    doc.setFontSize(10);
    const splitPlan = doc.splitTextToSize(plan, 170);
    doc.text(splitPlan, 20, 70);
    doc.save(`${businessName}_Business_Plan.pdf`);
    showToast('PDF downloaded!', 'success');
  };

  const handleSaveWord = () => {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun({ text: `Business Plan for ${businessName}`, bold: true, size: 32 })]
            }),
            new Paragraph({
              children: [new TextRun({ text: `Industry: ${industry}`, size: 24 })]
            }),
            new Paragraph({
              children: [new TextRun({ text: `Target Market: ${targetMarket}`, size: 24 })]
            }),
            new Paragraph({
              children: [new TextRun({ text: `USPs: ${usps}`, size: 24 })]
            }),
            new Paragraph({
              children: [new TextRun({ text: 'Plan:', bold: true, size: 24 })]
            }),
            new Paragraph({
              children: [new TextRun({ text: plan, size: 20 })]
            })
          ]
        }
      ]
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `${businessName}_Business_Plan.docx`);
      showToast('Word document downloaded!', 'success');
    });
  };

  const handleSaveText = () => {
    const blob = new Blob([plan], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${businessName}_Business_Plan.txt`);
    showToast('Text file downloaded!', 'success');
  };

  const isFormValid = businessName.trim() && industry.trim();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 animated-bg dark:bg-gray-900">
      <div className="w-full max-w-[112rem] bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-3 sm:p-4 lg:p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-extrabold text-blue-800 dark:text-blue-200 text-center flex-1">
            Business Plan Generator
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-1 px-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-200 flex items-center"
          >
            {darkMode ? (
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
              </svg>
            )}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex space-x-4 justify-center">
            <button
              onClick={handleGenerateSample}
              className="bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-200"
              disabled={loading}
            >
              Generate Sample Plan
            </button>
            <button
              onClick={handleLoadSavedPlan}
              className="bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-200"
              disabled={loading}
            >
              Load Saved Plan
            </button>
          </div>

          <div>
            <label
              htmlFor="businessName"
              className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-1 text-center"
            >
              Business Name
            </label>
            <input
              id="businessName"
              type="text"
              placeholder="Enter your business name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900 dark:text-gray-100 text-center bg-white dark:bg-gray-700 transition duration-200"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="industry"
              className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-1 text-center"
            >
              Industry
            </label>
            <input
              id="industry"
              type="text"
              placeholder="Enter your industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900 dark:text-gray-100 text-center bg-white dark:bg-gray-700 transition duration-200"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="targetMarket"
              className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-1 text-center"
            >
              Target Market
            </label>
            <input
              id="targetMarket"
              type="text"
              placeholder="Describe your target market"
              value={targetMarket}
              onChange={(e) => setTargetMarket(e.target.value)}
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900 dark:text-gray-100 text-center bg-white dark:bg-gray-700 transition duration-200"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="usps"
              className="block text-lg font-medium text-gray-700 dark:text-gray-200 mb-1 text-center"
            >
              Unique Selling Points
            </label>
            <textarea
              id="usps"
              placeholder="List your unique selling points"
              value={usps}
              onChange={(e) => setUsps(e.target.value)}
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900 dark:text-gray-100 text-center bg-white dark:bg-gray-700 transition duration-200"
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="flex space-x-4 justify-center">
            <button
              onClick={handleGenerate}
              className="flex-1 max-w-xs bg-blue-600 dark:bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate Plan'
              )}
            </button>
            <button
              onClick={handleClear}
              className="flex-1 max-w-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition duration-200"
              disabled={loading}
            >
              Clear Form
            </button>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {plan && (
            <div className="mt-4 bg-blue-50 dark:bg-gray-700 p-6 rounded-lg shadow-inner border border-gray-200 dark:border-gray-600 w-full">
              <h2 className="text-3xl font-semibold text-blue-800 dark:text-blue-200 mb-1 text-center">
                Business Plan for {businessName}
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-300 mb-3 text-center">Industry: {industry}</p>
              <div className="p-4">
                <pre className="text-lg text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-auto">
                  {plan}
                </pre>
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                <p>Word Count: {plan.split(/\s+/).filter(word => word.length > 0).length}</p>
                <p>Estimated Reading Time: {Math.ceil(plan.split(/\s+/).filter(word => word.length > 0).length / 200)} minute(s)</p>
              </div>
              <div className="mt-3 flex flex-wrap space-x-4 justify-center">
                <button
                  onClick={handleCopy}
                  className="bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-200 m-1"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={handleSavePDF}
                  className="bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-200 m-1"
                >
                  Save as PDF
                </button>
                <button
                  onClick={handleSaveWord}
                  className="bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-200 m-1"
                >
                  Save as Word
                </button>
                <button
                  onClick={handleSaveText}
                  className="bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-200 m-1"
                >
                  Save as Text
                </button>
              </div>
            </div>
          )}
        </div>

        {toast.message && (
          <div
            className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white shadow-lg animate-toast ${
              toast.type === 'success' ? 'bg-green-600 dark:bg-green-500' : 'bg-blue-600 dark:bg-blue-500'
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;