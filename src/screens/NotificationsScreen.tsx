
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import {
  AppNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
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
};

const NotificationsScreen = () => {
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState<AppNotification[]>(
    getNotifications(),
  );

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(() => {
      setNotifications(getNotifications());
    });

    return unsubscribe;
  }, []);

  const unreadCount = notifications.filter(item => !item.read).length;

  const handleNotificationPress = (notification: AppNotification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
  };

  const renderNotification = (notification: AppNotification) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationCard,
        !notification.read && styles.unreadCard,
      ]}
      activeOpacity={0.75}
      onPress={() => handleNotificationPress(notification)}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={notification.icon as any}
          size={23}
          color={COLORS.brown}
        />
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.titleRow}>
          <Text style={styles.notificationTitle}>
            {notification.title}
          </Text>

          {!notification.read && <View style={styles.unreadDot} />}
        </View>

        <Text style={styles.notificationMessage}>
          {notification.message}
        </Text>

        <Text style={styles.notificationTime}>
          {notification.time}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={COLORS.brown}
          />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            Stay updated with your activity
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Text style={styles.sectionSubtitle}>
            {unreadCount === 0
              ? 'You are all caught up'
              : `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`}
          </Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllNotificationsAsRead}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length > 0 ? (
          notifications.map(renderNotification)
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="notifications-off-outline"
                size={34}
                color={COLORS.brown}
              />
            </View>

            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyMessage}>
              New updates will appear here.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: COLORS.brown,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.brown,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 5,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.brown,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unreadCard: {
    borderColor: COLORS.pink,
    backgroundColor: '#FFFAFD',
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: COLORS.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  notificationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.brown,
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C77BA5',
  },
  notificationMessage: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.muted,
    marginTop: 7,
  },
  notificationTime: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
  },
  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 23,
    backgroundColor: COLORS.pink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.brown,
  },
  emptyMessage: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 8,
    textAlign: 'center',
  },
});
