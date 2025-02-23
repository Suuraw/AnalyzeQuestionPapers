import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, BookOpen, Tag } from 'lucide-react';
import { AnalysisResult } from '@/types';

interface ResultCardProps {
  result: AnalysisResult;
}

export function ResultCard({ result }: ResultCardProps) {
  return (
    <Card className="w-full flex flex-col h-full">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-lg sm:text-xl font-semibold line-clamp-2">
          {result.question}
        </CardTitle>
        <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-muted-foreground">
          <span>Frequency: {result.frequency}</span>
          <span className="hidden sm:inline">•</span>
          <span>Importance: {result.importance}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4 overflow-y-auto">
        <p className="text-sm sm:text-base line-clamp-3">{result.answer}</p>

        {result.topics.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Tag className="h-4 w-4" />
              <span>Topics</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.topics.map((topic) => (
                <Badge key={topic.id} variant="secondary" className="text-xs sm:text-sm">
                  {topic.name} ({topic.score}%)
                </Badge>
              ))}
            </div>
          </div>
        )}

        {result.resources.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ExternalLink className="h-4 w-4" />
                <span>External Resources</span>
              </div>
              <ul className="space-y-2 max-h-24 sm:max-h-32 overflow-y-auto">
                {result.resources.map((resource) => (
                  <li key={resource.id} className="text-xs sm:text-sm">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-primary line-clamp-1"
                    >
                      {resource.title}
                      <Badge variant="outline" className="text-xs">
                        Relevance: {resource.relevanceScore}%
                      </Badge>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {result.papers.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="h-4 w-4" />
                <span>Related Papers</span>
              </div>
              <ul className="space-y-1 max-h-20 sm:max-h-24 overflow-y-auto">
                {result.papers.map((paper) => (
                  <li key={paper.id} className="text-xs sm:text-sm line-clamp-1">
                    {paper.name} ({paper.year})
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}