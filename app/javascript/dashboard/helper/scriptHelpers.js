import {
  ANALYTICS_IDENTITY,
  CHATWOOT_RESET,
  CHATWOOT_SET_USER,
} from '../constants/appEvents';
import AnalyticsHelper from './AnalyticsHelper';
import DashboardAudioNotificationHelper from './AudioAlerts/DashboardAudioNotificationHelper';
import { emitter } from 'shared/helpers/mitt';

export const initializePendoEvents = () => {
  emitter.on(ANALYTICS_IDENTITY, ({ user }) => {
    if (!window.pendo) return;

    const { accounts = [] } = user;
    const currentAccount = accounts.find(
      account => account.id === user.account_id
    ) || {};

    pendo.initialize({
      visitor: {
        id: user.id,
        email: user.email,
        full_name: user.name,
        displayName: user.display_name,
        provider: user.provider,
        availability: currentAccount.availability,
        signInCount: user.sign_in_count,
        currentSignInAt: user.current_sign_in_at,
        lastSignInAt: user.last_sign_in_at,
        confirmedAt: user.confirmed_at,
        createdAt: user.created_at,
        otpRequiredForLogin: user.otp_required_for_login,
        accountId: user.account_id,
        role: currentAccount.role,
        accountAvailability: currentAccount.availability_status,
        autoOffline: currentAccount.auto_offline,
        activeAt: currentAccount.active_at,
      },
      account: {
        id: currentAccount.id,
        name: currentAccount.name,
        locale: currentAccount.locale,
        domain: currentAccount.domain,
        supportEmail: currentAccount.support_email,
        featureFlags: currentAccount.feature_flags,
        autoResolveDuration: currentAccount.auto_resolve_duration,
        status: currentAccount.status,
        createdAt: currentAccount.created_at,
      },
    });
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
