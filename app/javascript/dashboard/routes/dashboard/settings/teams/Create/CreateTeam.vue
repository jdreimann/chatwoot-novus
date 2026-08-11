<script>
import { useAlert } from 'dashboard/composables';
import AnalyticsHelper from 'dashboard/helper/AnalyticsHelper';
import { SETTINGS_EVENTS } from 'dashboard/helper/AnalyticsHelper/events';
import TeamForm from '../TeamForm.vue';
import router from '../../../../index';
import PageHeader from '../../SettingsSubPageHeader.vue';

export default {
  components: {
    TeamForm,
    PageHeader,
  },
  data() {
    return {
      enabledFeatures: {},
    };
  },
  methods: {
    async createTeam(data) {
      try {
        const team = await this.$store.dispatch('teams/create', {
          ...data,
        });
        AnalyticsHelper.track(SETTINGS_EVENTS.TEAM_CREATED, {
          teamId: team.id,
        });

        router.replace({
          name: 'settings_teams_add_agents',
          params: {
            page: 'new',
            teamId: team.id,
          },
        });
      } catch (error) {
        useAlert(this.$t('TEAMS_SETTINGS.TEAM_FORM.ERROR_MESSAGE'));
      }
    },
  },
};
</script>

<template>
  <div class="h-full w-full p-6 col-span-6 overflow-y-auto">
    <PageHeader
      :header-title="$t('TEAMS_SETTINGS.CREATE_FLOW.CREATE.TITLE')"
      :header-content="$t('TEAMS_SETTINGS.CREATE_FLOW.CREATE.DESC')"
    />
    <div class="flex flex-wrap">
      <TeamForm
        :on-submit="createTeam"
        :submit-in-progress="false"
        :submit-button-text="$t('TEAMS_SETTINGS.FORM.SUBMIT_CREATE')"
      />
    </div>
  </div>
</template>
