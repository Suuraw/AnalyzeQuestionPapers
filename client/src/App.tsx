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

    try {
      console.log(formData)
      const response = await fetch('http://localhost:3000/api/analyze', {
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <Hero />
        
        <main className="container py-12">
          <div className="mx-auto max-w-4xl space-y-8">
            <FileUpload
              files={files}
              setFiles={setFiles}
              isLoading={isLoading}
            />

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleAnalyze}
                disabled={files.length === 0 || isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? 'Analyzing...' : 'Analyze PDFs'}
              </Button>
            </div>

            {results.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Analysis Results</h2>
                <div className="grid gap-6">
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