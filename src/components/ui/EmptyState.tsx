const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h3 className="text-lg font-medium text-foreground">No items found</h3>
      <p className="text-muted-foreground">
        Try adjusting your search or filter to find what you are looking for.
      </p>
    </div>
  );
};

export default EmptyState;