import * as CONFIG from './config';

export default {
  template: `
    <div
      class="box-item"
      :class="{ 
        'box-item--missing': $isAuthenticated && !entry.inBox,
        'box-item--unobtainable': !entry.obtainable,
      }"
      @click.prevent="boxClick(entry)"
    >
      <img
        :src="entry.sprite"
        class="sprite"
        :class="{ 'sprite--gmax': entry.gmax }"
        height="40"
        loading="lazy"
      >
      <md-tooltip>
        {{ entry.dexNumber }}: {{ entry.name }}<span v-if="entry.form || entry.gender">, {{ entry.form || entry.gender }}</span>
      </md-tooltip>
    </div>
  `,
  props: {
    entry: {
      required: true,
      type: Object,
    }
  },
  methods: {
    boxClick(entry) {
      if (!this.$isAuthenticated || !entry.obtainable) {
        return;
      }

      let body = {
        values: [[ !entry.inBox ? "Yes" : "No" ]],
      };

      entry.inBox = !entry.inBox;

      this.$getGapiClient().then(gapi => {
        gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: CONFIG.SPREADSHEET_ID,
          range: `K${entry.id}`,
          valueInputOption: "USER_ENTERED",
          resource: body,
        })
        .then()
        .catch(err => {
          alert(`Sorry, couldn't complete that "in box" update.`);
          entry.inBox = !entry.inBox;
        });
      });
    },
  },
}


