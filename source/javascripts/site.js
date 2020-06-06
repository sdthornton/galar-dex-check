const CLIENT_ID = "794803752624-fl20v16vgu8nreunpvhelarirm8t0sd6.apps.googleusercontent.com";
const CLIENT_SECRET = "KMKNvWGUQUO5sbLigqgMrz2k";
const API_KEY = "AIzaSyA9N5BNv8dl6CRqb6xXqfxJ_VIxEiFS7eY";
const SPREADSHEET_ID = "1Ize2mVy0wiyY92nzgawZ7065_Rgw5ZQUkmJOwf95Y18";
const SPREADSHEET_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`;
const DISCOVERY_DOCS =["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const apiConfig = {
  apiKey: API_KEY,
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  discoveryDocs: DISCOVERY_DOCS,
  scope: SCOPE,
};

import Vue from 'vue';
import VueMaterial from 'vue-material';
import VueGapi from 'vue-gapi';
import DexBox from './DexBox';

Vue.use(VueMaterial);
Vue.use(VueGapi, apiConfig);

const app = new Vue({
  el: "#app",
  components: {
    DexBox,
  },
  data() {
    return {
      dexData: [],
      loadingGapi: true,
      loadingData: true,
      showMissing: false,
    };
  },
  computed: {
    loading() {
      return this.loadingGapi || this.loadingData;
    },
    chunkedUnobtainable() {
      let filtered = this.dexData.filter(d => !d.obtainable);
      return this.chunk(filtered, 30);
    },
    chunkedDexData() {
      let filtered = this.dexData.filter(d => {
        return (
          !d.gmax &&
          d.dexNumber.indexOf("#") == 0 ||
          this.isMew(d) ||
          this.isGalarSlowpoke(d)
        );
      });
      return this.chunk(filtered, 30);
    },
    chunkedHatchableHomeData() {
      let filtered = this.dexData.filter(d => {
        return (
          d.dexNumber == "-" &&
          !d.legendsAndMyths &&
          !d.gmax &&
          !this.isMew(d) &&
          !this.isGalarSlowpoke(d)
        );
      });
      return this.chunk(filtered, 30);
    },
    chunkedLegendaryHomeData() {
      let filtered = this.dexData.filter(d => {
        return (
          d.dexNumber == "-" &&
          d.legendsAndMyths &&
          !d.gmax &&
          !this.isMew(d)
        );
      });
      return this.chunk(filtered, 30);
    },
    chunkedGmaxData() {
      let filtered = this.dexData.filter(d => d.gmax && d.obtainable);
      return this.chunk(filtered, 30);
    },
    chunkedIsleData() {
      let filtered = this.dexData.filter(d => d.isleOfArmor);
      return this.chunk(filtered, 30);
    },
    chunkedTundraData() {
      let filtered = this.dexData.filter(d => d.crownTundra);
      return this.chunk(filtered, 30);
    },
    missingMons() {
      let filtered = this.dexData.filter(d => !d.inBox && d.obtainable);
      return filtered;
    },
  },
  created() {
    this.$getGapiClient().then(() => this.loadingGapi = false);
    try {
      window.setInterval(this.$refreshToken(), 2.7e+6);
    } catch (err) {
      console.error(err);
    }
  },
  mounted() {
    this.fetchDexData();
    document.addEventListener('keydown', e => {
      if (e.key == "Escape") {
        this.showMissing = false;
      }
    });
  },
  methods: {
    chunk(arr, size) {
      return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => {
        return arr.slice(i * size, i * size + size);
      });
    },
    isMew(d) {
      return d.name == "Mew";
    },
    isGalarSlowpoke(d) {
      return d.name == "Slowpoke" && d.form == "Galar";
    },
    createDexJson(d) {
      let spriteReg = /\=image\("/gi;
      return {
        "id": Number(d.values[0].formattedValue),
        "dexNumber": d.values[1].userEnteredValue.stringValue,
        "name": d.values[2].userEnteredValue.stringValue,
        "sprite": d.values[3].userEnteredValue.formulaValue.replace(spriteReg, '').replace('")', ''),
        "gender": d.values[4] && d.values[4].userEnteredValue ? d.values[4].userEnteredValue.stringValue : "",
        "form": d.values[5] && d.values[5].userEnteredValue ? d.values[5].userEnteredValue.stringValue : "",
        "gmax": d.values[6] && d.values[6].userEnteredValue ? true : false,
        "isleOfArmor": d.values[8] && d.values[8].userEnteredValue ? true : false,
        "crownTundra": d.values[9] && d.values[9].userEnteredValue ? true : false,
        "inBox": d.values[10].userEnteredValue.stringValue == "Yes" ? true : false,
        "obtainable": d.values[12] && d.values[12].userEnteredValue ? false : true,
        "legendsAndMyths": (d.values[13] || d.values[14]) && (d.values[13].userEnteredValue || d.values[14].userEnteredValue) ? true : false,
      };
    },
    fetchDexData() {
      fetch(`${SPREADSHEET_URL}?key=${API_KEY}&includeGridData=true&ranges=A2:O822&fields=sheets%2Fdata%2FrowData%2Fvalues`, {
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async res => {
        let data = await res.json();
        let dexData =
          data.sheets[0].data[0].rowData
            .filter(d => d.values && d.values[0] && d.values[0].userEnteredValue)
            .filter(d => !(d.values[7] && d.values[7].userEnteredValue))
            .map(d => this.createDexJson(d));
        this.dexData = dexData;
      }).finally(() => this.loadingData = false);
    },
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
          spreadsheetId: SPREADSHEET_ID,
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
});
