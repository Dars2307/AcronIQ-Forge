import { useGetDashboardQueues } from "@workspace/api-client-react"; // Assuming this hook is generated

interface QueueStatus {
  name: string;
  counts: {
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    waiting: number;
    paused: number;
  };
}

const StatusPill = ({ label, count, color }: { label: string; count: number; color:string }) => {
  if (count === 0) return null;
  return (
    <div className={`flex items-center gap-2 px-2.5 py-1 text-xs font-medium rounded-full ${color}`}>
      <span>{label}</span>
      <span className="font-semibold">{count}</span>
    </div>
  );
};

const QueueCard = ({ status }: { status: QueueStatus }) => {
  const { name, counts } = status;
  const total = Object.values(counts).reduce((sum, val) => sum + val, 0);

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-white">{name}</h3>
        <span className="text-sm text-gray-400">Total: {total}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <StatusPill label="Active" count={counts.active} color="bg-blue-500/20 text-blue-300" />
        <StatusPill label="Waiting" count={counts.waiting} color="bg-yellow-500/20 text-yellow-300" />
        <StatusPill label="Completed" count={counts.completed} color="bg-green-500/20 text-green-300" />
        <StatusPill label="Failed" count={counts.failed} color="bg-red-500/20 text-red-300" />
        <StatusPill label="Delayed" count={counts.delayed} color="bg-purple-500/20 text-purple-300" />
        <StatusPill label="Paused" count={counts.paused} color="bg-gray-500/20 text-gray-300" />
      </div>
    </div>
  );
};

export const QueueStatusDashboard = () => {
  const { data: queues, isLoading, error } = useGetDashboardQueues({
    query: {
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });

  if (isLoading) return <div className="text-gray-400">Loading queue status...</div>;
  if (error) return <div className="text-red-400">Error loading queue status: {error.message}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">Job Queue Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {queues?.map((queue) => <QueueCard key={queue.name} status={queue} />)}
      </div>
    </div>
  );
};