import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellOff, AlertTriangle, CheckCircle2, XCircle, Info, X } from 'lucide-react';
import type { PNode } from '@/types/pnode';
import { toast } from 'sonner';

export type NotificationType = 'node_offline' | 'node_online' | 'low_storage' | 'high_utilization' | 'version_outdated';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  node?: PNode;
  read: boolean;
}

interface NotificationSystemProps {
  nodes: PNode[];
}

// Notification preferences stored in localStorage
const PREFS_KEY = 'xandeum_notification_prefs';

interface NotificationPrefs {
  enabled: boolean;
  nodeOffline: boolean;
  nodeOnline: boolean;
  lowStorage: boolean;
  highUtilization: boolean;
  versionOutdated: boolean;
  storageThreshold: number; // GB remaining
  utilizationThreshold: number; // percentage
}

const defaultPrefs: NotificationPrefs = {
  enabled: true,
  nodeOffline: true,
  nodeOnline: true,
  lowStorage: true,
  highUtilization: true,
  versionOutdated: true,
  storageThreshold: 100, // 100 GB
  utilizationThreshold: 90, // 90%
};

export function NotificationSystem({ nodes }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);
  const [previousNodes, setPreviousNodes] = useState<Map<string, PNode>>(new Map());
  const [showPanel, setShowPanel] = useState(false);

  // Load preferences
  useEffect(() => {
    const saved = localStorage.getItem(PREFS_KEY);
    if (saved) {
      try {
        setPrefs({ ...defaultPrefs, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to load notification preferences:', e);
      }
    }
  }, []);

  // Save preferences
  const savePrefs = useCallback((newPrefs: NotificationPrefs) => {
    setPrefs(newPrefs);
    localStorage.setItem(PREFS_KEY, JSON.stringify(newPrefs));
  }, []);

  // Create notification
  const createNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    node?: PNode
  ) => {
    const notification: Notification = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
      timestamp: new Date(),
      node,
      read: false,
    };

    setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50

    // Show toast
    if (prefs.enabled) {
      const Icon = type === 'node_offline' ? XCircle :
                   type === 'node_online' ? CheckCircle2 :
                   type.includes('storage') || type.includes('utilization') ? AlertTriangle :
                   Info;

      toast(title, {
        description: message,
        icon: <Icon className="h-4 w-4" />,
      });
    }
  }, [prefs.enabled]);

  // Monitor nodes for changes
  useEffect(() => {
    if (!prefs.enabled) return;

    const currentNodes = new Map(nodes.map(n => [n.pubkey, n]));

    // Check for status changes
    nodes.forEach(node => {
      const previous = previousNodes.get(node.pubkey);

      if (previous) {
        // Node went offline
        if (previous.status === 'online' && node.status === 'offline' && prefs.nodeOffline) {
          createNotification(
            'node_offline',
            'Node Offline',
            `pNode ${node.pubkey.slice(0, 12)}... has gone offline`,
            node
          );
        }

        // Node came online
        if (previous.status !== 'online' && node.status === 'online' && prefs.nodeOnline) {
          createNotification(
            'node_online',
            'Node Online',
            `pNode ${node.pubkey.slice(0, 12)}... is now online`,
            node
          );
        }

        // Low storage
        const storageRemaining = node.storageCommitted && node.storageUsed
          ? (node.storageCommitted - node.storageUsed) / (1024 ** 3)
          : 0;
        if (storageRemaining < prefs.storageThreshold && prefs.lowStorage) {
          const prevRemaining = previous.storageCommitted && previous.storageUsed
            ? (previous.storageCommitted - previous.storageUsed) / (1024 ** 3)
            : 0;
          if (prevRemaining >= prefs.storageThreshold) {
            createNotification(
              'low_storage',
              'Low Storage Warning',
              `pNode ${node.pubkey.slice(0, 12)}... has only ${storageRemaining.toFixed(0)} GB remaining`,
              node
            );
          }
        }

        // High utilization
        const utilization = node.storageUsed && node.storageCommitted && node.storageCommitted > 0
          ? (node.storageUsed / node.storageCommitted) * 100
          : 0;
        if (utilization >= prefs.utilizationThreshold && prefs.highUtilization) {
          const prevUtilization = previous.storageUsed && previous.storageCommitted && previous.storageCommitted > 0
            ? (previous.storageUsed / previous.storageCommitted) * 100
            : 0;
          if (prevUtilization < prefs.utilizationThreshold) {
            createNotification(
              'high_utilization',
              'High Storage Utilization',
              `pNode ${node.pubkey.slice(0, 12)}... is at ${utilization.toFixed(1)}% storage capacity`,
              node
            );
          }
        }
      }

      // Check version (assuming latest is highest)
      if (prefs.versionOutdated) {
        const versions = nodes.map(n => n.version).sort();
        const latestVersion = versions[versions.length - 1];
        if (node.version !== latestVersion) {
          const existingVersionAlert = notifications.find(
            n => n.type === 'version_outdated' && n.node?.pubkey === node.pubkey
          );
          if (!existingVersionAlert) {
            createNotification(
              'version_outdated',
              'Outdated Version',
              `pNode ${node.pubkey.slice(0, 12)}... is running v${node.version} (latest: v${latestVersion})`,
              node
            );
          }
        }
      }
    });

    setPreviousNodes(currentNodes);
  }, [nodes, prefs, previousNodes, createNotification, notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'node_offline': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'node_online': return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'low_storage':
      case 'high_utilization':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'version_outdated':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <>
      {/* Notification Bell Button */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPanel(!showPanel)}
          className="relative"
        >
          {prefs.enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* Notification Panel */}
        {showPanel && (
          <Card className="absolute right-0 top-full mt-2 w-96 max-h-[600px] overflow-hidden z-50 shadow-lg">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Mark all read
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAll}
                      className="text-xs"
                    >
                      Clear all
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPanel(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="p-4 border-b border-border bg-muted/10 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications-enabled">Enable Notifications</Label>
                <Switch
                  id="notifications-enabled"
                  checked={prefs.enabled}
                  onCheckedChange={(checked) => savePrefs({ ...prefs, enabled: checked })}
                />
              </div>

              {prefs.enabled && (
                <div className="space-y-2 text-sm pl-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Node offline</span>
                    <Switch
                      checked={prefs.nodeOffline}
                      onCheckedChange={(checked) => savePrefs({ ...prefs, nodeOffline: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Node online</span>
                    <Switch
                      checked={prefs.nodeOnline}
                      onCheckedChange={(checked) => savePrefs({ ...prefs, nodeOnline: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Low storage</span>
                    <Switch
                      checked={prefs.lowStorage}
                      onCheckedChange={(checked) => savePrefs({ ...prefs, lowStorage: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">High utilization</span>
                    <Switch
                      checked={prefs.highUtilization}
                      onCheckedChange={(checked) => savePrefs({ ...prefs, highUtilization: checked })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-border hover:bg-muted/20 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm">{notification.title}</p>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
