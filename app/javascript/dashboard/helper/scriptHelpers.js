import {
  ANALYTICS_IDENTITY,
  CHATWOOT_RESET,
  CHATWOOT_SET_USER,
} from '../constants/appEvents';
import AnalyticsHelper from './AnalyticsHelper';
import DashboardAudioNotificationHelper from './AudioAlerts/DashboardAudioNotificationHelper';
import { emitter } from 'shared/helpers/mitt';

export const initializePendoEvents = () => {
  window.pendo.initialize({
    visitor: { id: '' },
  });

  emitter.on(ANALYTICS_IDENTITY, ({ user }) => {
    const { accounts = [], account_id: accountId } = user;
    const [currentAccount] = accounts.filter(
      account => account.id === accountId
    );

    window.pendo.identify({
      visitor: {
        id: user.id,
        email: user.email,
        full_name: user.name,
        display_name: user.display_name,
        provider: user.provider,
        availability: currentAccount?.availability,
        created_at: user.created_at,
        role: currentAccount?.role,
        account_id: user.account_id,
      },
      account: {
        id: currentAccount?.id,
        name: currentAccount?.name,
        status: currentAccount?.status,
      },
    });
  });

  emitter.on(CHATWOOT_RESET, () => {
    if (window.pendo && window.pendo.clearSession) {
      window.pendo.clearSession();
    }
  });
};

export const initializeAnalyticsEvents = () => {
  AnalyticsHelper.init();
  emitter.on(ANALYTICS_IDENTITY, ({ user }) => {
    AnalyticsHelper.identify(user);
  });
};

export const initializeAudioAlerts = user => {
  const { ui_settings: uiSettings } = user || {};
  const {
    always_play_audio_alert: alwaysPlayAudioAlert,
    enable_audio_alerts: audioAlertType,
    alert_if_unread_assigned_conversation_exist: alertIfUnreadConversationExist,
    notification_tone: audioAlertTone,
    // UI Settings can be undefined initially as we don't send the
    // entire payload for the user during the signup process.
  } = uiSettings || {};

  DashboardAudioNotificationHelper.set({
    currentUser: user,
    audioAlertType: audioAlertType || 'none',
    audioAlertTone: audioAlertTone || 'ding',
    alwaysPlayAudioAlert: alwaysPlayAudioAlert || false,
    alertIfUnreadConversationExist: alertIfUnreadConversationExist || false,
  });
};

export const initializeChatwootEvents = () => {
  emitter.on(CHATWOOT_RESET, () => {
    if (window.$chatwoot) {
      window.$chatwoot.reset();
    }
  });
  emitter.on(CHATWOOT_SET_USER, ({ user }) => {
    if (window.$chatwoot) {
      window.$chatwoot.setUser(user.email, {
        avatar_url: user.avatar_url,
        email: user.email,
        identifier_hash: user.hmac_identifier,
        name: user.name,
      });
      window.$chatwoot.setCustomAttributes({
        signedUpAt: user.created_at,
        cloudCustomer: 'true',
        account_id: user.account_id,
      });
    }

    initializeAudioAlerts(user);
  });
};
