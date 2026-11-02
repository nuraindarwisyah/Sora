
import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Ionicons} from '@react-native-vector-icons/ionicons';

import {useExpenses} from '../hooks/useExpenses';
import {
  EXPENSE_CATEGORIES,
  CATEGORY_COLORS,
} from '../constants/expenseCategories';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import typography from '../theme/typography';

const CATEGORY_ICONS: Record<
  string,
  React.ComponentProps<typeof Ionicons>['name']
> = {
  'Food & Drinks': 'restaurant-outline',
  Transport: 'car-outline',
  Shopping: 'bag-handle-outline',
  'Bills & Utilities': 'receipt-outline',
  Groceries: 'basket-outline',
  Health: 'medkit-outline',
  Education: 'book-outline',
  Entertainment: 'game-controller-outline',
  Travel: 'airplane-outline',
  'Personal Care': 'cut-outline',
  Housing: 'home-outline',
  Other: 'grid-outline',
};

type Expense = {
  id: number | string;
  title?: string;
  amount: number | string;
  category?: string | null;
  date?: string;
};

const TransactionsScreen = ({navigation}: any) => {
  const [activeTab, setActiveTab] = useState<'Expenses' | 'Income'>(
    'Expenses',
  );

  const {
    data: expensesData,
    isLoading,
    isError,
    refetch,
  } = useExpenses();

  const expenses: Expense[] = useMemo(() => {
    if (Array.isArray(expensesData)) {
      return expensesData as Expense[];
    }

    if (
      expensesData &&
      typeof expensesData === 'object' &&
      Array.isArray((expensesData as any).data)
    ) {
      return (expensesData as any).data as Expense[];
    }

    return [];
  }, [expensesData]);

  const totalSpent = useMemo(
    () =>
      expenses.reduce(
        (total, expense) => total + (Number(expense.amount) || 0),
        0,
      ),
    [expenses],
  );

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};

    EXPENSE_CATEGORIES.forEach(category => {
      totals[category] = 0;
    });

    expenses.forEach(expense => {
      const expenseCategory = expense.category?.trim() || 'Other';

      const matchedCategory = (
        EXPENSE_CATEGORIES as readonly string[]
      ).includes(expenseCategory)
        ? expenseCategory
        : 'Other';

      totals[matchedCategory] =
        (totals[matchedCategory] || 0) +
        (Number(expense.amount) || 0);
    });

    return totals;
  }, [expenses]);

  const formatAmount = (amount: number) =>
    `RM ${amount.toLocaleString('en-MY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const openAddExpense = () => {
    navigation.navigate('AddExpense');
  };

  const renderCategoryCard = (
    category: (typeof EXPENSE_CATEGORIES)[number],
    index: number,
  ) => (
    <View key={category} style={styles.categoryCard}>
      <View
        style={[
          styles.categoryIcon,
          {
            backgroundColor:
              CATEGORY_COLORS[index % CATEGORY_COLORS.length],
          },
        ]}>
        <Ionicons
          name={CATEGORY_ICONS[category] || 'apps-outline'}
          size={25}
          color={colors.primary}
        />
      </View>

      <Text style={styles.categoryName} numberOfLines={2}>
        {category}
      </Text>

      <Text style={styles.categoryAmount} numberOfLines={1}>
        {formatAmount(categoryTotals[category] || 0)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle="dark-content"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.heading}>Transactions</Text>
            <Text style={styles.subtitle}>
              Keep track of your money
            </Text>
          </View>
        </View>

        {/* Total Spending Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View style={styles.summaryIcon}>
              <Ionicons
                name="wallet-outline"
                size={24}
                color={colors.primary}
              />
            </View>

            <Text style={styles.summaryLabel}>
              Total Expenses
            </Text>
          </View>

          <Text style={styles.totalAmount}>
            {formatAmount(totalSpent)}
          </Text>

          <Text style={styles.summaryDescription}>
            Your recorded expenses
          </Text>
        </View>

        {/* Expenses / Income Tabs */}
        <View style={styles.tabsContainer}>
          {(['Expenses', 'Income'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category Dashboard */}
        {activeTab === 'Expenses' ? (
          <>
            {/* Categories Heading */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>
                  Categories
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Spending by category
                </Text>
              </View>

              <Text style={styles.categoryCount}>
                {EXPENSE_CATEGORIES.length} categories
              </Text>
            </View>

            {/* Create New Expense - Above Category Grid */}
            <TouchableOpacity
              style={styles.createButton}
              onPress={openAddExpense}
              activeOpacity={0.8}>
              <View style={styles.createButtonIcon}>
                <Ionicons
                  name="add"
                  size={24}
                  color={colors.primary}
                />
              </View>

              <View style={styles.createButtonTextContainer}>
                <Text style={styles.createButtonTitle}>
                  Create New Expense
                </Text>
                <Text style={styles.createButtonSubtitle}>
                  Record a new transaction
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={21}
                color={colors.primary}
              />
            </TouchableOpacity>

            {/* Category Grid */}
            {isLoading ? (
              <View style={styles.stateContainer}>
                <ActivityIndicator
                  size="large"
                  color={colors.primary}
                />
                <Text style={styles.stateText}>
                  Loading your expenses...
                </Text>
              </View>
            ) : isError ? (
              <View style={styles.stateContainer}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={42}
                  color={colors.textSecondary}
                />

                <Text style={styles.stateTitle}>
                  Unable to load expenses
                </Text>

                <Text style={styles.stateText}>
                  Please check your connection and try again.
                </Text>

                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => refetch()}
                  activeOpacity={0.8}>
                  <Text style={styles.retryButtonText}>
                    Try Again
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.categoryGrid}>
                {EXPENSE_CATEGORIES.map((category, index) =>
                  renderCategoryCard(category, index),
                )}
              </View>
            )}
          </>
        ) : (
          <View style={styles.incomePlaceholder}>
            <View style={styles.incomeIcon}>
              <Ionicons
                name="trending-up-outline"
                size={34}
                color={colors.primary}
              />
            </View>

            <Text style={styles.incomeTitle}>
              Income Tracking
            </Text>

            <Text style={styles.incomeDescription}>
              Income tracking will be available when the income
              feature is connected.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },

  headerTextContainer: {
    flex: 1,
  },

  heading: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },

  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  summaryCard: {
    backgroundColor: '#EEDAE6',
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  summaryLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },

  totalAmount: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginTop: spacing.lg,
  },

  summaryDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginTop: spacing.xs,
  },

  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 5,
    marginBottom: spacing.xl,
  },

  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },

  activeTab: {
    backgroundColor: colors.primary,
  },

  tabText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },

  activeTabText: {
    color: colors.white,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },

  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  categoryCount: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  categoryCard: {
    width: '31.5%',
    minHeight: 145,
    backgroundColor: colors.white,
    borderRadius: 19,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },

  categoryIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  categoryName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    minHeight: 34,
  },

  categoryAmount: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginTop: spacing.xs,
  },

  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 19,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },

  createButtonIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  createButtonTextContainer: {
    flex: 1,
  },

  createButtonTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },

  createButtonSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: 20,
    marginBottom: spacing.lg,
  },

  stateTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginTop: spacing.md,
  },

  stateText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 21,
  },

  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },

  retryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  incomePlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: spacing.xl,
    marginTop: spacing.md,
  },

  incomeIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: '#CFF7D3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },

  incomeTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },

  incomeDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.sm,
  },
});

export default TransactionsScreen;
