import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { subjects } from '@/data/sampleData';
import { useAppStore } from '@/store/useAppStore';

export function SubjectGrid() {
  const navigate = useNavigate();
  const { setSubject } = useAppStore();
  
  console.log('SubjectGrid rendering, subjects:', subjects);

  const handleSubjectClick = (subjectId: string) => {
    setSubject(subjectId as any);
    navigate(`/${subjectId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo-large.svg" 
              alt="RDM Logo" 
              className="h-16 md:h-20 w-auto"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            JEE Learning Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master JEE concepts with structured learning paths. Choose your subject to begin your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {subjects.map((subject) => (
            <Card 
              key={subject.id}
              className="card-hover cursor-pointer border-0 shadow-soft hover:shadow-medium transition-all duration-300 bg-gradient-card"
              onClick={() => handleSubjectClick(subject.id)}
            >
              <CardHeader className="text-center pb-4">
                <div className="text-6xl mb-4">{subject.icon}</div>
                <CardTitle className="text-2xl font-bold text-card-foreground">
                  {subject.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-muted-foreground text-base leading-relaxed">
                  {subject.description}
                </CardDescription>
                <div className={`mt-6 h-1 w-full rounded-full bg-gradient-to-r ${subject.color} opacity-70`} />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground">
            Start with any subject and progress through beginner to advanced levels
          </p>
        </div>
      </div>
    </div>
  );
}