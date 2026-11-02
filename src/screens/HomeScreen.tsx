import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Ionicons} from '@react-native-vector-icons/ionicons';
import {useExpenses} from '../hooks/useExpenses';
import type {Expense} from '../services/expenseService';
import {
  getUnreadCount,
  subscribeToNotifications,
} from '../services/notificationService';

const COLORS = {
  background: '#FEFBEA',
  white: '#FFFFFF',
  pink: '#EEDAE6',
  brown: '#392B20',
  lime: '#F2F1C1',
  blue: '#C3E9FE',
  yellow: '#FEF9CF',
  muted: '#887F76',
  border: '#E9E2D6',
  danger: '#B84D4D',
};

const CATEGORY_STYLES: Record<
  string,
  {background: string; icon: string}
> = {
  Food: {
    background: COLORS.pink,
    icon: 'fast-food-outline',
  },
  Transport: {
    background: COLORS.blue,
    icon: 'car-outline',
  },
  Shopping: {
    background: COLORS.lime,
    icon: 'bag-handle-outline',
  },
  Bills: {
    background: COLORS.yellow,
    icon: 'receipt-outline',
  },
  Entertainment: {
    background: COLORS.pink,
    icon: 'film-outline',
  },
  Health: {
    background: COLORS.blue,
    icon: 'medkit-outline',
  },
  Education: {
    background: COLORS.lime,
    icon: 'book-outline',
  },
  Travel: {
    background: COLORS.blue,
    icon: 'airplane-outline',
  },
  Other: {
    background: COLORS.yellow,
    icon: 'wallet-outline',
  },
};

const getCategoryStyle = (category?: string) => {
  const normalizedCategory = category?.trim().toLowerCase();

  if (!normalizedCategory) {
    return CATEGORY_STYLES.Other;
  }

  const matchingCategory = Object.keys(CATEGORY_STYLES).find(
    key => key.toLowerCase() === normalizedCategory,
  );

  return matchingCategory
    ? CATEGORY_STYLES[matchingCategory]
    : CATEGORY_STYLES.Other;
};

const formatCurrency = (amount: number | string): string => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return 'RM 0.00';
  }

  return `RM ${numericAmount.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (dateString: string): string => {
  if (!dateString) {
    return 'Date unavailable';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return date.toLocaleDateString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

type HomeScreenProps = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

const HomeScreen = ({navigation}: HomeScreenProps) => {
  const [unreadCount, setUnreadCount] = useState(getUnreadCount());

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(() => {
      setUnreadCount(getUnreadCount());
    });

    return unsubscribe;
  }, []);

  const {
    data: expenses,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useExpenses();

  const expenseList: Expense[] = expenses ?? [];

  const totalSpent = expenseList.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0,
  );

  const expenseCount = expenseList.length;

  const averageSpent =
    expenseCount > 0 ? totalSpent / expenseCount : 0;

  const recentExpenses = [...expenseList]
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      return dateB - dateA;
    })
    .slice(0, 5);

  const renderExpense = (expense: Expense) => {
    const categoryStyle = getCategoryStyle(expense.category);

    return (
      <View key={expense.id} style={styles.transactionRow}>
        <View
          style={[
            styles.categoryIcon,
            {backgroundColor: categoryStyle.background},
          ]}>
          <Ionicons
            name={categoryStyle.icon as any}
            size={23}
            color={COLORS.brown}
          />
        </View>

        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle} numberOfLines={1}>
            {expense.title}
          </Text>

          <Text style={styles.transactionSubtitle} numberOfLines={1}>
            {expense.category || 'Other'} · {formatDate(expense.date)}
          </Text>
        </View>

        <Text style={styles.transactionAmount}>
          {formatCurrency(expense.amount)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={COLORS.brown}
          />
        }>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>sora.</Text>
            <Text style={styles.greeting}>Your money, in view.</Text>
          </View>

          <View style={styles.headerActions}>
            {/* Notifications */}
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate('Notifications')}
              accessibilityLabel={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} unread`
                  : 'Open notifications'
              }
              accessibilityRole="button"
              activeOpacity={0.75}>
              <Ionicons
                name="notifications-outline"
                size={23}
                color={COLORS.brown}
              />

              {unreadCount > 0 && (
                <View
                  style={[
                    styles.notificationBadge,
                    unreadCount < 10
                      ? styles.notificationCountBadge
                      : styles.notificationDot,
                  ]}>
                  {unreadCount < 10 && (
                    <Text style={styles.notificationBadgeText}>
                      {unreadCount}
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>

            {/* Profile */}
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
              accessibilityLabel="Open profile"
              accessibilityRole="button"
              activeOpacity={0.75}>
              <Ionicons
                name="person-outline"
                size={22}
                color={COLORS.brown}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main spending card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={styles.summaryLabel}>TOTAL EXPENSES</Text>
              <Text style={styles.summaryCaption}>
                Across your recorded transactions
              </Text>
            </View>

            <View style={styles.summaryIcon}>
              <Ionicons
                name="wallet-outline"
                size={24}
                color={COLORS.brown}
              />
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.brown}
              style={styles.summaryLoader}
            />
          ) : (
            <Text style={styles.totalAmount}>
              {formatCurrency(totalSpent)}
            </Text>
          )}

          <View style={styles.summaryDivider} />

          <View style={styles.summaryBottomRow}>
            <View style={styles.summaryInfo}>
              <Ionicons
                name="receipt-outline"
                size={17}
                color={COLORS.brown}
              />
              <Text style={styles.summaryInfoText}>
                {expenseCount} transaction{expenseCount === 1 ? '' : 's'}
              </Text>
            </View>

            <View style={styles.summaryInfo}>
              <Ionicons
                name="analytics-outline"
                size={17}
                color={COLORS.brown}
              />
              <Text style={styles.summaryInfoText}>
                Avg. {formatCurrency(averageSpent)}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddExpense')}
            activeOpacity={0.8}>
            <Ionicons
              name="add-circle-outline"
              size={23}
              color={COLORS.white}
            />
            <Text style={styles.addButtonText}>Add expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Transactions')}
            activeOpacity={0.8}>
            <Ionicons
              name="list-outline"
              size={22}
              color={COLORS.brown}
            />
          </TouchableOpacity>
        </View>

        {/* Overview cards */}
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>At a glance</Text>
        </View>

        <View style={styles.overviewRow}>
          <View style={[styles.overviewCard, styles.overviewPink]}>
            <View style={styles.overviewIcon}>
              <Ionicons
                name="receipt-outline"
                size={21}
                color={COLORS.brown}
              />
            </View>

            <Text style={styles.overviewLabel}>Transactions</Text>

            <Text style={styles.overviewValue}>
              {isLoading ? '—' : expenseCount}
            </Text>

            <Text style={styles.overviewCaption}>
              Recorded expenses
            </Text>
          </View>

          <View style={[styles.overviewCard, styles.overviewBlue]}>
            <View style={styles.overviewIcon}>
              <Ionicons
                name="wallet-outline"
                size={21}
                color={COLORS.brown}
              />
            </View>

            <Text style={styles.overviewLabel}>Average spend</Text>

            <Text style={styles.overviewValue}>
              {isLoading ? '—' : formatCurrency(averageSpent)}
            </Text>

            <Text style={styles.overviewCaption}>
              Per transaction
            </Text>
          </View>
        </View>

        {/* Recent transactions */}
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Recent transactions</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Transactions')}
            activeOpacity={0.7}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsCard}>
          {isLoading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="large" color={COLORS.brown} />
              <Text style={styles.stateText}>
                Loading your expenses...
              </Text>
            </View>
          ) : isError ? (
            <View style={styles.stateContainer}>
              <View style={styles.stateIcon}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={29}
                  color={COLORS.brown}
                />
              </View>

              <Text style={styles.stateTitle}>
                Couldn't load expenses
              </Text>

              <Text style={styles.stateText}>
                Check your connection and try again.
              </Text>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => refetch()}
                activeOpacity={0.75}>
                <Text style={styles.retryButtonText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : recentExpenses.length === 0 ? (
            <View style={styles.stateContainer}>
              <View style={styles.stateIcon}>
                <Ionicons
                  name="receipt-outline"
                  size={30}
                  color={COLORS.brown}
                />
              </View>

              <Text style={styles.stateTitle}>Nothing here yet</Text>

              <Text style={styles.stateText}>
                Add your first expense to start tracking your spending.
              </Text>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => navigation.navigate('AddExpense')}
                activeOpacity={0.75}>
                <Text style={styles.retryButtonText}>
                  Add your first expense
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            recentExpenses.map(renderExpense)
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons
            name="checkmark-circle-outline"
            size={16}
            color={COLORS.muted}
          />
          <Text style={styles.footerText}>
            Your expenses, organised in one place.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 35,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },

  notificationBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    elevation: 2,
  },

  notificationCountBadge: {
    minWidth: 17,
    height: 17,
    borderRadius: 8.5,
    paddingHorizontal: 3,
  },

  notificationDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },

  notificationBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    textAlign: 'center',
    includeFontPadding: false,
  },

  brand: {
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: -1.3,
    color: COLORS.brown,
  },

  greeting: {
    marginTop: 3,
    fontSize: 14,
    color: COLORS.muted,
  },

  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryCard: {
    backgroundColor: COLORS.lime,
    borderRadius: 25,
    padding: 22,
    marginBottom: 17,
  },

  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  summaryLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: COLORS.brown,
  },

  summaryCaption: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 5,
  },

  summaryIcon: {
    height: 45,
    width: 45,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryLoader: {
    alignSelf: 'flex-start',
    marginTop: 24,
    marginBottom: 25,
  },

  totalAmount: {
    fontSize: 35,
    fontWeight: '800',
    letterSpacing: -1,
    color: COLORS.brown,
    marginTop: 23,
    marginBottom: 22,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(57,43,32,0.15)',
    marginBottom: 15,
  },

  summaryBottomRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },

  summaryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  summaryInfoText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.brown,
  },

  quickActions: {
    flexDirection: 'row',
    gap: 11,
    marginBottom: 28,
  },

  addButton: {
    flex: 1,
    minHeight: 54,
    backgroundColor: COLORS.brown,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  addButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },

  secondaryButton: {
    width: 55,
    height: 54,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.brown,
    letterSpacing: -0.4,
  },

  seeAll: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.brown,
  },

  overviewRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 29,
  },

  overviewCard: {
    flex: 1,
    minHeight: 157,
    padding: 15,
    borderRadius: 21,
  },

  overviewPink: {
    backgroundColor: COLORS.pink,
  },

  overviewBlue: {
    backgroundColor: COLORS.blue,
  },

  overviewIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  overviewLabel: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 5,
  },

  overviewValue: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.brown,
  },

  overviewCaption: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 5,
  },

  transactionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  transactionRow: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1ECE5',
  },

  categoryIcon: {
    width: 47,
    height: 47,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  transactionDetails: {
    flex: 1,
    marginRight: 8,
  },

  transactionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.brown,
  },

  transactionSubtitle: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 5,
  },

  transactionAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.brown,
  },

  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 30,
  },

  stateIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: COLORS.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  stateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.brown,
    textAlign: 'center',
  },

  stateText: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },

  retryButton: {
    backgroundColor: COLORS.brown,
    paddingHorizontal: 19,
    paddingVertical: 11,
    borderRadius: 13,
    marginTop: 16,
  },

  retryButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 25,
  },

  footerText: {
    fontSize: 11,
    color: COLORS.muted,
  },
});

export default HomeScreen;