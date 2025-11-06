import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, MoveLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ComingSoonPage = ({ title, description }) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">{title}</CardTitle>
          {description && (
            <CardDescription className="text-base">{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg bg-muted/30 p-8 text-center">
            {/* Main Icon */}
            <div className="rounded-full bg-primary/10 p-4">
              <Rocket className="h-12 w-12 text-primary" strokeWidth={1.5} />
            </div>

            {/* Message */}
            <h2 className="mt-6 text-2xl font-semibold">
              This Page is Under Construction
            </h2>
            <p className="mt-2 text-muted-foreground">
              We're hard at work building this feature and will have it ready for you soon.
            </p>

            {/* Action Button */}
            <Button 
              variant="outline" 
              className="mt-8" 
              onClick={() => navigate(-1)} // navigate(-1) is a simple "go back"
            >
              <MoveLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};