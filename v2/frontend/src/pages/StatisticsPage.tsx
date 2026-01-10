import { Layout } from '../components/layout/Layout';
import { StatCard } from '../components/statistics/StatCard';
import { LeaderboardTable } from '../components/statistics/LeaderboardTable';
import { useStatistics } from '../hooks/useStatistics';
import { TrendingUp, Users, Star } from 'lucide-react';

export function StatisticsPage() {
  const { data, isLoading, error } = useStatistics();
  const stats = data?.statistics;

  if (isLoading) {
    return (
      <Layout>
        <div className="glass-card p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-navy-900 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </Layout>
    );
  }

  if (error || !stats) {
    return (
      <Layout>
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Error Loading Statistics</h2>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : 'Failed to load statistics'}
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-navy-900 mb-2">Statistics</h1>
        <p className="text-lg text-gray-600">Comprehensive insights into The Wheel</p>
      </div>

      {/* Section 1: Restaurant Overview */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-navy-900 mb-4">Restaurant Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Restaurants"
            value={stats.totalRestaurants}
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatCard
            title="Pending Approval"
            value={stats.pendingRestaurants}
            subtitle="Awaiting admin review"
          />
          <StatCard
            title="Active"
            value={stats.activeRestaurants}
            subtitle="Ready for the wheel"
          />
          <StatCard
            title="Upcoming"
            value={stats.upcomingRestaurants}
            subtitle="Selected from wheel"
          />
          <StatCard
            title="Visited"
            value={stats.visitedRestaurants}
            subtitle="Completed visits"
          />
          <StatCard
            title="Fast Food"
            value={stats.fastFoodCount}
            subtitle="Quick bites"
          />
          <StatCard
            title="Non-Fast Food"
            value={stats.nonFastFoodCount}
            subtitle="Sit-down dining"
          />
        </div>
      </div>

      {/* Section 2: Rating Statistics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-navy-900 mb-4">Rating Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Overall Average"
            value={stats.overallAverageRating > 0 ? stats.overallAverageRating.toFixed(2) : 'N/A'}
            subtitle="Out of 10"
            icon={<Star className="w-5 h-5" />}
          />
          <StatCard
            title="Total Ratings"
            value={stats.totalRatingsGiven}
            subtitle="Ratings submitted"
          />
          <StatCard
            title="Rated Restaurants"
            value={stats.ratedRestaurantCount}
            subtitle="Have reviews"
          />
          <StatCard
            title="Unrated Restaurants"
            value={stats.unratedRestaurantCount}
            subtitle="Awaiting feedback"
          />
        </div>
      </div>

      {/* Section 3: User Statistics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-navy-900 mb-4">User Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="Administrators"
            value={stats.adminCount}
            subtitle="Full access"
          />
          <StatCard
            title="Provisional Users"
            value={stats.provisionalCount}
            subtitle="Limited access"
          />
        </div>
      </div>

      {/* Section 4: Top 10 Rated Restaurants */}
      <div className="mb-8">
        <LeaderboardTable
          title="Top 10 Rated Restaurants"
          entries={stats.topRatedRestaurants.slice(0, 10).map((r) => ({
            id: r.id,
            name: r.name,
            value: `${r.average_rating.toFixed(2)} / 10`,
            subtitle: `${r.rating_count} rating${r.rating_count !== 1 ? 's' : ''}`,
            link: `/nominations/${r.id}`,
          }))}
          valueLabel="Rating"
          emptyMessage="No rated restaurants yet"
        />
      </div>

      {/* Section 5: Most Active Nominators */}
      <div className="mb-8">
        <LeaderboardTable
          title="Most Active Nominators"
          entries={stats.mostActiveNominators.slice(0, 10).map((u) => ({
            id: u.id,
            name: u.name || u.email,
            value: u.nomination_count,
            subtitle: u.name ? u.email : undefined,
          }))}
          valueLabel="Nominations"
          emptyMessage="No nominations yet"
        />
      </div>

      {/* Section 6: Most Active Raters */}
      <div className="mb-8">
        <LeaderboardTable
          title="Most Active Raters"
          entries={stats.mostActiveRaters.slice(0, 10).map((u) => ({
            id: u.id,
            name: u.name || u.email,
            value: u.rating_count,
            subtitle: u.name ? u.email : undefined,
          }))}
          valueLabel="Ratings"
          emptyMessage="No ratings yet"
        />
      </div>

      {/* Section 7: Full Restaurant Leaderboard */}
      <div className="mb-8">
        <LeaderboardTable
          title="Full Restaurant Leaderboard"
          entries={stats.restaurantLeaderboard.map((r) => ({
            id: r.id,
            name: r.name,
            value: `${r.average_rating.toFixed(2)} / 10`,
            subtitle: `${r.rating_count} rating${r.rating_count !== 1 ? 's' : ''} • ${r.state}`,
            link: `/nominations/${r.id}`,
          }))}
          valueLabel="Rating"
          emptyMessage="No rated restaurants yet"
        />
      </div>

      {/* Section 8: User Rating Averages */}
      <div className="mb-8">
        <LeaderboardTable
          title="User Rating Averages"
          entries={stats.userRatingAverages.map((u) => ({
            id: u.id,
            name: u.name || u.email,
            value: `${u.average_rating.toFixed(2)} / 10`,
            subtitle: `${u.rating_count} rating${u.rating_count !== 1 ? 's' : ''}${u.name ? ` • ${u.email}` : ''}`,
          }))}
          valueLabel="Avg Rating"
          emptyMessage="No ratings yet"
          showRank={false}
        />
      </div>

      {/* Section 9: Nominator Quality */}
      <div className="mb-8">
        <LeaderboardTable
          title="Nominator Quality"
          entries={stats.nominatorRestaurantAverages.map((u) => ({
            id: u.id,
            name: u.name || u.email,
            value: u.average_rating > 0 ? `${u.average_rating.toFixed(2)} / 10` : 'N/A',
            subtitle: `${u.visited_nominated_count} visited / ${u.nominated_count} total${u.name ? ` • ${u.email}` : ''}`,
          }))}
          valueLabel="Avg of Nominations"
          emptyMessage="No nominated restaurants have been visited yet"
          showRank={false}
        />
      </div>
    </Layout>
  );
}
