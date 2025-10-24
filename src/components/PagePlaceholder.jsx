import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const PagePlaceholder = ({ title, description }) => {
  return (
    <div className="container mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{title}</CardTitle>
          {description && (
            <CardDescription className="text-base">{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
            <div className="text-center">
              <p className="text-lg font-medium text-muted-foreground">
                This is a placeholder for the {title} page
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Content will be implemented here based on your requirements
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
