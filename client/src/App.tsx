import { useState } from 'react';
import { FileWithPreview, AnalysisResult } from '@/types';
import { FileUpload } from '@/components/FileUpload';
import { ResultCard } from '@/components/ResultCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Footer } from '@/components/Footer';

function App() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError('Please select at least one PDF file to analyze.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('pdfs', file);
    });
//https://analyzequestionpapers.onrender.com/api/analyze
    try {
      console.log(formData);
      const response = await fetch('https://analyzequestionpapers.onrender.com/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze PDFs. Please try again.');
      }
    
      const data = await response.json();
      console.log(data);
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <Hero />
        
        <main className="container px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-grow">
          <div className="mx-auto max-w-full sm:max-w-4xl space-y-6 sm:space-y-8">
            <FileUpload
              files={files}
              setFiles={setFiles}
              isLoading={isLoading}
            />

            {error && (
              <Alert variant="destructive" className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm sm:text-base">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleAnalyze}
                disabled={files.length === 0 || isLoading}
                className="w-full sm:w-auto text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-3"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Analyzing...' : 'Analyze PDFs'}
              </Button>
            </div>

            {results.length > 0 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center sm:text-left">
                  Analysis Results
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  {results.map((result) => (
                    <ResultCard key={result.id} result={result} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;