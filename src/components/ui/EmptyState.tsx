const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h3 className="text-lg font-medium text-gray-900">No items to display</h3>
      <p className="text-muted-foreground">
        There are no items available at the moment.
      </p>
    </div>
  );
};

export default EmptyState;
