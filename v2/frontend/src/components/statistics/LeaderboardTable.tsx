import { Link } from 'react-router';

interface LeaderboardEntry {
  id?: number;
  name: string;
  value: string | number;
  subtitle?: string;
  link?: string;
}

interface LeaderboardTableProps {
  title: string;
  entries: LeaderboardEntry[];
  valueLabel: string;
  emptyMessage?: string;
  showRank?: boolean;
}

export function LeaderboardTable({
  title,
  entries,
  valueLabel,
  emptyMessage = 'No data available',
  showRank = true,
}: LeaderboardTableProps) {
  return (
    <div className="glass-card p-6">
      <h2 className="text-2xl font-bold text-navy-900 mb-6">{title}</h2>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">{emptyMessage}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {showRank && (
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600 w-12">
                    #
                  </th>
                )}
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                  Name
                </th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">
                  {valueLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr
                  key={entry.id || index}
                  className="border-b border-gray-100 hover:bg-white/30 transition-colors"
                >
                  {showRank && (
                    <td className="py-3 px-2 text-gray-600 font-medium">
                      {index + 1}
                    </td>
                  )}
                  <td className="py-3 px-2">
                    {entry.link ? (
                      <Link
                        to={entry.link}
                        className="font-medium text-navy-900 hover:underline"
                      >
                        {entry.name}
                      </Link>
                    ) : (
                      <span className="font-medium text-navy-900">{entry.name}</span>
                    )}
                    {entry.subtitle && (
                      <div className="text-sm text-gray-500">{entry.subtitle}</div>
                    )}
                  </td>
                  <td className="py-3 px-2 text-right font-semibold text-navy-900">
                    {entry.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
